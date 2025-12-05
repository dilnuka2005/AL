import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { ChatMessage } from '../types';
import { supabase } from '../services/supabaseClient';

// --- Audio Helpers ---
// Create context lazily or resume on interaction to avoid suspended state
const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
let audioSource: AudioBufferSourceNode | null = null;

function base64ToArrayBuffer(base64: string) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

// Helper to decode raw PCM data (16-bit signed integer, 24kHz mono)
function pcmToAudioBuffer(buffer: ArrayBuffer, ctx: AudioContext): AudioBuffer {
    const pcm16 = new Int16Array(buffer);
    const frameCount = pcm16.length;
    // Create an AudioBuffer: 1 channel, frameCount, 24000Hz sample rate
    const audioBuffer = ctx.createBuffer(1, frameCount, 24000);
    const channelData = audioBuffer.getChannelData(0);
    
    for (let i = 0; i < frameCount; i++) {
        // Normalize 16-bit integer to float [-1.0, 1.0]
        channelData[i] = pcm16[i] / 32768.0;
    }
    return audioBuffer;
}

// --- Main Component ---
const AITutor: React.FC = () => {
    // Tab State
    const [activeTab, setActiveTab] = useState<'chat' | 'image' | 'video' | 'live'>('chat');

    // Chat State
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatFile, setChatFile] = useState<{ data: string, mimeType: string } | null>(null);
    const [useThinking, setUseThinking] = useState(false);
    const [useGrounding, setUseGrounding] = useState<'none' | 'search' | 'maps'>('none');
    const [isRecording, setIsRecording] = useState(false);
    const [context, setContext] = useState('');

    // Image State
    const [imageMode, setImageMode] = useState<'generate' | 'edit' | 'analyze'>('generate');
    const [imagePrompt, setImagePrompt] = useState('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [uploadImage, setUploadImage] = useState<{ data: string, mimeType: string } | null>(null);
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [imageSize, setImageSize] = useState('1K');

    // Video State
    const [videoPrompt, setVideoPrompt] = useState('');
    const [videoMode, setVideoMode] = useState<'generate' | 'analyze'>('generate');
    const [videoFile, setVideoFile] = useState<{ data: string, mimeType: string } | null>(null); // For analysis or image-to-video
    const [videoStatus, setVideoStatus] = useState('');
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [videoAspectRatio, setVideoAspectRatio] = useState('16:9');

    // Live State
    const [isLiveConnected, setIsLiveConnected] = useState(false);
    const [liveStatus, setLiveStatus] = useState('Disconnected');
    const [liveVisualizer, setLiveVisualizer] = useState<number[]>(new Array(5).fill(10));

    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    // Load Context
    useEffect(() => {
        const loadContext = async () => {
            const { data: notices } = await supabase.from('notices').select('title, body').limit(3);
            const { data: dates } = await supabase.from('exam_dates').select('date, details').limit(3);
            const contextStr = `Notices: ${notices?.map(n => n.title).join(', ') || 'None'}. Dates: ${dates?.map(d => `${d.date}: ${d.details}`).join(', ') || 'None'}.`;
            setContext(contextStr);
        };
        loadContext();
    }, []);

    // Scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, videoStatus]);

    // --- Helpers ---
    const getFileBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const base64 = await getFileBase64(file);
            if (type === 'image') {
                if (activeTab === 'chat') setChatFile({ data: base64, mimeType: file.type });
                else setUploadImage({ data: base64, mimeType: file.type });
            } else {
                setVideoFile({ data: base64, mimeType: file.type });
            }
        }
    };

    // --- CHAT FUNCTIONS ---
    const handleTranscribeAudio = async () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            setIsRecording(true);
            const recognition = new SpeechRecognition();
            recognition.onresult = (event: any) => {
                setInput(prev => prev + ' ' + event.results[0][0].transcript);
                setIsRecording(false);
            };
            recognition.onerror = () => setIsRecording(false);
            recognition.start();
        } else {
            alert("Speech recognition not supported");
        }
    };

    const handleChatSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() && !chatFile) return;

        const userMsg = input;
        const currentFile = chatFile;
        setInput('');
        setChatFile(null);
        setMessages(prev => [...prev, { role: 'user', text: userMsg + (currentFile ? ' [Attachment]' : '') }]);
        setIsLoading(true);

        try {
            const apiKey = process.env.API_KEY || '';
            const ai = new GoogleGenAI({ apiKey });
            let model = 'gemini-3-pro-preview';
            let config: any = { systemInstruction: `You are an AI Tutor. Context: ${context}` };

            // Thinking Mode
            if (useThinking) {
                model = 'gemini-3-pro-preview';
                config.thinkingConfig = { thinkingBudget: 32768 };
            } 
            // Grounding
            else if (useGrounding !== 'none') {
                model = 'gemini-2.5-flash';
                if (useGrounding === 'search') config.tools = [{ googleSearch: {} }];
                if (useGrounding === 'maps') config.tools = [{ googleMaps: {} }];
            }
            // Fast Responses
            else if (!currentFile) {
                model = 'gemini-2.5-flash-lite';
            }

            const contentParts: any[] = [];
            if (currentFile) {
                contentParts.push({ inlineData: { mimeType: currentFile.mimeType, data: currentFile.data } });
                // If analyzing image/video, ensure correct model
                if (currentFile.mimeType.startsWith('video')) model = 'gemini-3-pro-preview';
                else if (currentFile.mimeType.startsWith('image') && !useThinking) model = 'gemini-3-pro-preview';
            }
            contentParts.push({ text: userMsg });

            const response = await ai.models.generateContent({
                model,
                contents: [{ role: 'user', parts: contentParts }],
                config
            });

            // Handle Grounding Metadata
            let text = response.text || "No response";
            if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
                 const sources = response.candidates[0].groundingMetadata.groundingChunks
                    .map((c: any) => c.web?.uri || c.maps?.placeId).filter(Boolean);
                 if (sources.length) text += `\n\nSources: ${sources.join(', ')}`;
            }

            setMessages(prev => [...prev, { role: 'model', text }]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'model', text: "Error: " + (error as any).message }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTTS = async (text: string) => {
        try {
            const apiKey = process.env.API_KEY || '';
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                },
            });
            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                 await audioContext.resume();
                 const buffer = base64ToArrayBuffer(base64Audio);
                 const audioBuffer = pcmToAudioBuffer(buffer, audioContext);
                 
                 if(audioSource) audioSource.disconnect();
                 audioSource = audioContext.createBufferSource();
                 audioSource.buffer = audioBuffer;
                 audioSource.connect(audioContext.destination);
                 audioSource.start();
            }
        } catch (e) { console.error("TTS Error", e); }
    };

    // --- IMAGE FUNCTIONS ---
    const handleImageAction = async () => {
        if (!imagePrompt && !uploadImage) return;
        setIsLoading(true);
        setGeneratedImage(null);

        try {
            const apiKey = process.env.API_KEY || '';
            const ai = new GoogleGenAI({ apiKey });

            if (imageMode === 'generate') {
                const response = await ai.models.generateContent({
                    model: 'gemini-3-pro-image-preview',
                    contents: { parts: [{ text: imagePrompt }] },
                    config: {
                        imageConfig: { aspectRatio: aspectRatio, imageSize: imageSize }
                    }
                });
                
                response.candidates?.[0]?.content?.parts?.forEach((part: any) => {
                    if (part.inlineData) setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
                });

            } else if (imageMode === 'edit') {
                if (!uploadImage) throw new Error("Upload an image to edit");
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: {
                        parts: [
                            { inlineData: { mimeType: uploadImage.mimeType, data: uploadImage.data } },
                            { text: imagePrompt }
                        ]
                    }
                });
                response.candidates?.[0]?.content?.parts?.forEach((part: any) => {
                    if (part.inlineData) setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
                });

            } else if (imageMode === 'analyze') {
                 if (!uploadImage) throw new Error("Upload an image to analyze");
                 const response = await ai.models.generateContent({
                     model: 'gemini-3-pro-preview',
                     contents: {
                        parts: [
                            { inlineData: { mimeType: uploadImage.mimeType, data: uploadImage.data } },
                            { text: imagePrompt || "Analyze this image in detail." }
                        ]
                    }
                 });
                 setGeneratedImage(null);
                 alert(response.text);
            }

        } catch (e: any) {
            alert("Image Error: " + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    // --- VIDEO FUNCTIONS ---
    const handleVideoAction = async () => {
        if (!videoPrompt && !videoFile) return;
        setIsLoading(true);
        setVideoStatus('Processing...');
        setGeneratedVideoUrl(null);

        try {
            const apiKey = process.env.API_KEY || '';
            const ai = new GoogleGenAI({ apiKey });

            if (videoMode === 'generate') {
                let operation: any;
                const config = {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: videoAspectRatio
                };

                if (videoFile) {
                     operation = await ai.models.generateVideos({
                        model: 'veo-3.1-fast-generate-preview',
                        prompt: videoPrompt,
                        image: { imageBytes: videoFile.data, mimeType: videoFile.mimeType },
                        config
                     });
                } else {
                    operation = await ai.models.generateVideos({
                        model: 'veo-3.1-fast-generate-preview',
                        prompt: videoPrompt,
                        config
                    });
                }

                while (!operation.done) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    operation = await ai.operations.getVideosOperation({ operation });
                    setVideoStatus('Generating video... please wait.');
                }

                const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
                if (uri) {
                    const vidRes = await fetch(`${uri}&key=${apiKey}`);
                    const blob = await vidRes.blob();
                    setGeneratedVideoUrl(URL.createObjectURL(blob));
                    setVideoStatus('Done!');
                }

            } else {
                 if (!videoFile) throw new Error("Upload a video to analyze");
                 const response = await ai.models.generateContent({
                    model: 'gemini-3-pro-preview',
                    contents: {
                        parts: [
                            { inlineData: { mimeType: videoFile.mimeType, data: videoFile.data } },
                            { text: videoPrompt || "Describe this video." }
                        ]
                    }
                 });
                 setVideoStatus(response.text || "Analysis complete");
            }
        } catch (e: any) {
            setVideoStatus("Error: " + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    // --- LIVE API FUNCTIONS ---
    const toggleLive = async () => {
        if (isLiveConnected) {
             setIsLiveConnected(false);
             setLiveStatus("Disconnected");
             window.location.reload();
             return;
        }

        try {
            setIsLiveConnected(true);
            setLiveStatus("Connecting...");
            const apiKey = process.env.API_KEY || '';
            const ai = new GoogleGenAI({ apiKey });

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const source = inputContext.createMediaStreamSource(stream);
            const processor = inputContext.createScriptProcessor(4096, 1, 1);

            let nextStartTime = 0;

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                },
                callbacks: {
                    onopen: () => {
                        setLiveStatus("Live Connected - Speak Now");
                        processor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            const pcmData = new Int16Array(inputData.length);
                            for (let i = 0; i < inputData.length; i++) {
                                pcmData[i] = inputData[i] * 0x7FFF;
                            }
                            let binary = '';
                            const bytes = new Uint8Array(pcmData.buffer);
                            for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
                            const b64 = btoa(binary);

                            sessionPromise.then(session => {
                                session.sendRealtimeInput({ media: { mimeType: 'audio/pcm;rate=16000', data: b64 } });
                            });
                            
                            setLiveVisualizer(prev => prev.map(() => Math.random() * 100));
                        };
                        source.connect(processor);
                        processor.connect(inputContext.destination);
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        const b64 = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (b64) {
                            await audioContext.resume();
                            const buffer = base64ToArrayBuffer(b64);
                            const audioBuffer = pcmToAudioBuffer(buffer, audioContext);
                            
                            const src = audioContext.createBufferSource();
                            src.buffer = audioBuffer;
                            src.connect(audioContext.destination);
                            nextStartTime = Math.max(audioContext.currentTime, nextStartTime);
                            src.start(nextStartTime);
                            nextStartTime += audioBuffer.duration;
                        }
                    },
                    onclose: () => setLiveStatus("Disconnected"),
                    onerror: () => setLiveStatus("Error Occurred")
                }
            });

        } catch (e) {
            console.error(e);
            setLiveStatus("Connection Failed");
            setIsLiveConnected(false);
        }
    };

    return (
        <div className="h-[calc(100vh-100px)] animate__animated animate__fadeIn flex flex-col max-w-7xl mx-auto">
            
            {/* --- Header & Tabs --- */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-white shadow-lg">
                        <i className="fas fa-microchip text-xl"></i>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">AI Studio</h2>
                        <p className="text-xs text-gray-400">Powered by Gemini 2.5 & 3.0</p>
                    </div>
                </div>
                
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                    {[
                        { id: 'chat', label: 'Chat', icon: 'fa-comments' },
                        { id: 'image', label: 'Image', icon: 'fa-image' },
                        { id: 'video', label: 'Video', icon: 'fa-video' },
                        { id: 'live', label: 'Live', icon: 'fa-microphone-lines' }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <i className={`fas ${tab.icon}`}></i> <span className="hidden md:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* --- Content Area --- */}
            <div className="flex-1 glass rounded-3xl border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl relative overflow-hidden flex flex-col shadow-2xl">
                
                {/* === CHAT TAB === */}
                {activeTab === 'chat' && (
                    <>
                        {/* Config Bar */}
                        <div className="px-6 py-3 border-b border-white/5 flex gap-4 overflow-x-auto">
                            <button onClick={() => setUseThinking(!useThinking)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${useThinking ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'border-white/10 text-gray-400'}`}>
                                <i className="fas fa-brain"></i> Deep Thinking
                            </button>
                            <div className="h-6 w-px bg-white/10 my-auto"></div>
                            <button onClick={() => setUseGrounding(useGrounding === 'search' ? 'none' : 'search')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${useGrounding === 'search' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'border-white/10 text-gray-400'}`}>
                                <i className="fab fa-google"></i> Search
                            </button>
                            <button onClick={() => setUseGrounding(useGrounding === 'maps' ? 'none' : 'maps')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${useGrounding === 'maps' ? 'bg-green-500/20 border-green-500 text-green-400' : 'border-white/10 text-gray-400'}`}>
                                <i className="fas fa-map-marker-alt"></i> Maps
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-br-sm' : 'bg-white/5 border border-white/10 text-gray-200 rounded-bl-sm'}`}>
                                        {msg.text}
                                        {msg.role === 'model' && <button onClick={() => handleTTS(msg.text)} className="ml-2 text-gray-400 hover:text-white"><i className="fas fa-volume-up"></i></button>}
                                    </div>
                                </div>
                            ))}
                            {isLoading && <div className="text-emerald-500 text-xs px-6 animate-pulse">Gemini is thinking...</div>}
                            <div ref={chatEndRef}></div>
                        </div>

                        {/* Input */}
                        <form onSubmit={handleChatSend} className="p-4 bg-black/40 border-t border-white/10 flex gap-2">
                             <input type="file" ref={fileInputRef} onChange={(e) => handleFileSelect(e, 'image')} className="hidden" accept="image/*,video/*" />
                             <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all"><i className="fas fa-paperclip"></i></button>
                             <button type="button" onClick={handleTranscribeAudio} className={`p-3 rounded-xl transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 text-gray-400'}`}><i className="fas fa-microphone"></i></button>
                             <input value={input} onChange={e => setInput(e.target.value)} placeholder="Message Gemini..." className="flex-1 bg-white/5 rounded-xl px-4 text-white outline-none focus:ring-1 focus:ring-emerald-500" />
                             <button type="submit" className="p-3 bg-emerald-600 rounded-xl text-white hover:bg-emerald-500 transition-all"><i className="fas fa-paper-plane"></i></button>
                        </form>
                        {chatFile && <div className="absolute bottom-20 left-6 bg-emerald-900/50 px-3 py-1 rounded text-xs text-emerald-200 border border-emerald-500/30">File attached</div>}
                    </>
                )}

                {/* === IMAGE TAB === */}
                {activeTab === 'image' && (
                    <div className="flex h-full">
                        <div className="w-1/3 border-r border-white/10 p-6 flex flex-col gap-6 overflow-y-auto">
                            <div className="flex bg-white/5 rounded-lg p-1">
                                {['generate', 'edit', 'analyze'].map(m => (
                                    <button key={m} onClick={() => setImageMode(m as any)} className={`flex-1 py-2 text-xs font-bold uppercase rounded ${imageMode === m ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}>{m}</button>
                                ))}
                            </div>
                            
                            {imageMode === 'generate' && (
                                <>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Aspect Ratio</label>
                                        <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm outline-none">
                                            <option value="1:1">1:1 (Square)</option>
                                            <option value="2:3">2:3</option>
                                            <option value="3:2">3:2</option>
                                            <option value="3:4">3:4</option>
                                            <option value="4:3">4:3</option>
                                            <option value="9:16">9:16 (Portrait)</option>
                                            <option value="16:9">16:9 (Landscape)</option>
                                            <option value="21:9">21:9</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Size</label>
                                        <select value={imageSize} onChange={e => setImageSize(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm outline-none">
                                            <option value="1K">1K</option>
                                            <option value="2K">2K</option>
                                            <option value="4K">4K</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {(imageMode === 'edit' || imageMode === 'analyze') && (
                                <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-emerald-500/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <input type="file" ref={fileInputRef} onChange={(e) => handleFileSelect(e, 'image')} className="hidden" accept="image/*" />
                                    <i className="fas fa-cloud-upload-alt text-2xl text-gray-500 mb-2"></i>
                                    <p className="text-xs text-gray-400">{uploadImage ? "Image Selected" : "Upload Image"}</p>
                                </div>
                            )}

                            <div className="flex-1">
                                <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Prompt</label>
                                <textarea value={imagePrompt} onChange={e => setImagePrompt(e.target.value)} className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm outline-none resize-none" placeholder={imageMode === 'edit' ? "e.g., Add a retro filter" : "Describe the image..."}></textarea>
                            </div>

                            <button onClick={handleImageAction} disabled={isLoading} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-bold transition-all disabled:opacity-50">
                                {isLoading ? 'Processing...' : imageMode === 'generate' ? 'Generate' : imageMode === 'edit' ? 'Edit Image' : 'Analyze'}
                            </button>
                        </div>
                        <div className="flex-1 bg-black/20 flex items-center justify-center p-8 relative">
                            {isLoading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>}
                            {generatedImage ? (
                                <img src={generatedImage} alt="Result" className="max-w-full max-h-full rounded-lg shadow-2xl border border-white/10" />
                            ) : (
                                <div className="text-gray-600 text-center"><i className="fas fa-image text-4xl mb-2"></i><p>Output will appear here</p></div>
                            )}
                        </div>
                    </div>
                )}

                {/* === VIDEO TAB === */}
                {activeTab === 'video' && (
                    <div className="flex h-full flex-col">
                        <div className="p-6 border-b border-white/10 flex flex-wrap gap-4 items-center">
                            <select value={videoMode} onChange={e => setVideoMode(e.target.value as any)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none">
                                <option value="generate">Generate (Veo)</option>
                                <option value="analyze">Analyze (Pro)</option>
                            </select>
                            
                            {videoMode === 'generate' && (
                                <select value={videoAspectRatio} onChange={e => setVideoAspectRatio(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none">
                                    <option value="16:9">16:9</option>
                                    <option value="9:16">9:16</option>
                                </select>
                            )}

                            <input type="text" value={videoPrompt} onChange={e => setVideoPrompt(e.target.value)} placeholder="Describe the video..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none min-w-[200px]" />
                            <button onClick={() => videoInputRef.current?.click()} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 text-sm font-bold border border-white/10 whitespace-nowrap">
                                {videoFile ? "File Attached" : "Attach File"}
                            </button>
                            <input type="file" ref={videoInputRef} onChange={e => handleFileSelect(e, 'video')} className="hidden" accept="video/*,image/*" />
                            <button onClick={handleVideoAction} disabled={isLoading} className="px-6 py-2 bg-pink-600 hover:bg-pink-500 rounded-lg text-white font-bold shadow-lg transition-all disabled:opacity-50">Run</button>
                        </div>
                        <div className="flex-1 bg-black/20 flex items-center justify-center p-8 relative">
                            {generatedVideoUrl ? (
                                <video controls src={generatedVideoUrl} className="max-w-full max-h-full rounded-xl shadow-2xl border border-white/10" />
                            ) : (
                                <div className="text-center">
                                    <div className="text-gray-500 mb-4 whitespace-pre-wrap">{videoStatus || "Output area"}</div>
                                    {isLoading && <div className="inline-block w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* === LIVE TAB === */}
                {activeTab === 'live' && (
                    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none"></div>
                        
                        {/* Visualizer */}
                        <div className="flex gap-2 items-center h-32 mb-12">
                            {liveVisualizer.map((v, i) => (
                                <div key={i} className="w-4 bg-emerald-500 rounded-full transition-all duration-75" style={{ height: `${Math.max(10, v)}%`, opacity: isLiveConnected ? 1 : 0.3 }}></div>
                            ))}
                        </div>

                        <div className="text-center z-10">
                            <h3 className="text-4xl font-bold text-white mb-2">{isLiveConnected ? "Listening..." : "Start Conversation"}</h3>
                            <p className="text-gray-400 mb-8">{liveStatus}</p>
                            
                            <button 
                                onClick={toggleLive}
                                className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all transform hover:scale-105 ${isLiveConnected ? 'bg-red-500 text-white animate-pulse shadow-red-500/30' : 'bg-emerald-600 text-white shadow-emerald-500/30'}`}
                            >
                                <i className={`fas ${isLiveConnected ? 'fa-phone-slash' : 'fa-microphone'}`}></i>
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AITutor;