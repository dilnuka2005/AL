import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

const CodeGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('html');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setCode('');
    setOutput('');

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key not found");
      const ai = new GoogleGenAI({ apiKey });

      const model = 'gemini-2.5-flash';
      const sysPrompt = `You are a code generator. Write valid ${language} code for the user's request. 
      If the language is HTML, include CSS and JS inside the HTML file in a single block. 
      DO NOT include markdown backticks (like \`\`\`). Just return the raw code.`;

      const result = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { systemInstruction: sysPrompt }
      });

      const generatedCode = result.text?.trim() || '';
      // Strip backticks if the model ignores instruction
      const cleanCode = generatedCode.replace(/^```[a-z]*\n/i, '').replace(/\n```$/, '');
      
      setCode(cleanCode);
      setActiveTab('code');

    } catch (error) {
      console.error(error);
      alert('Failed to generate code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRun = async () => {
    setActiveTab('preview');
    if (['html', 'css', 'javascript'].includes(language)) {
       // Direct render for web
       return; 
    }

    // For other languages, simulate execution via AI
    setIsLoading(true);
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("API Key not found");
        const ai = new GoogleGenAI({ apiKey });
        
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Execute this ${language} code conceptually and show the expected output:\n\n${code}`,
            config: { systemInstruction: "You are a code execution engine. Show ONLY the output of the code." }
        });
        setOutput(result.text || "No output generated.");
    } catch (e) {
        setOutput("Error executing code simulation.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] animate__animated animate__fadeIn flex flex-col max-w-6xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">AI Code Lab</h2>
        <p className="text-gray-400 text-sm">Generate, Edit, and Run code instantly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
        {/* Controls */}
        <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col gap-4 h-full">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Language</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['html', 'python', 'php', 'sql', 'css'].map(lang => (
                            <button 
                                key={lang}
                                onClick={() => setLanguage(lang)}
                                className={`py-2 rounded-lg text-sm font-bold uppercase transition-all ${language === lang ? 'bg-emerald-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 flex flex-col">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Prompt</label>
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={`Describe the ${language.toUpperCase()} code you want...`}
                        className="flex-1 w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-emerald-500 outline-none resize-none"
                    ></textarea>
                </div>

                <button 
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-bold text-white shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                    {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>} Generate Code
                </button>
            </div>
        </div>

        {/* Editor & Preview */}
        <div className="lg:col-span-2 glass rounded-2xl border border-white/5 overflow-hidden flex flex-col bg-[#1e1e1e]">
             <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-white/5">
                <div className="flex gap-1">
                    <button 
                        onClick={() => setActiveTab('code')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'code' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <i className="fas fa-code mr-2"></i> Editor
                    </button>
                    <button 
                        onClick={() => setActiveTab('preview')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'preview' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <i className="fas fa-play mr-2"></i> Preview / Run
                    </button>
                </div>
                {activeTab === 'code' && code && (
                    <button onClick={handleRun} className="text-emerald-400 hover:text-emerald-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                        <i className="fas fa-play"></i> Run Code
                    </button>
                )}
             </div>

             <div className="flex-1 relative overflow-hidden">
                {activeTab === 'code' ? (
                    <textarea 
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="absolute inset-0 w-full h-full bg-[#1e1e1e] text-gray-300 font-mono text-sm p-4 outline-none resize-none"
                        spellCheck="false"
                    ></textarea>
                ) : (
                    <div className="absolute inset-0 bg-white w-full h-full">
                        {language === 'html' || language === 'css' ? (
                            <iframe 
                                title="preview"
                                srcDoc={code}
                                className="w-full h-full border-none"
                            />
                        ) : (
                            <div className="w-full h-full bg-[#1e1e1e] p-4 font-mono text-sm overflow-auto">
                                <div className="text-gray-500 mb-2">$ execute {language} script.py</div>
                                {isLoading ? (
                                    <div className="text-yellow-400">Running simulation...</div>
                                ) : (
                                    <pre className="text-emerald-400 whitespace-pre-wrap">{output}</pre>
                                )}
                            </div>
                        )}
                    </div>
                )}
             </div>
        </div>
      </div>
    </div>
  );
};

export default CodeGenerator;