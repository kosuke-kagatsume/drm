import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff } from 'lucide-react';

export default function VoiceCommand() {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('待機中');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Web Speech APIのサポートチェック
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setStatus('音声認識非対応');
      return;
    }

    const SpeechRecognition =
      (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'ja-JP';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setStatus('聞き取り中...');
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setTranscript(transcript);

      if (event.results[current].isFinal) {
        processCommand(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      setStatus(`エラー: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setStatus('待機中');
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [navigate]);

  const processCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();

    // コマンドマッピング
    const commands: { [key: string]: () => void } = {
      ダッシュボード: () => navigate('/dashboard'),
      だっしゅぼーど: () => navigate('/dashboard'),
      ホーム: () => navigate('/dashboard'),
      地図: () => navigate('/map'),
      ちず: () => navigate('/map'),
      マップ: () => navigate('/map'),
      プロジェクト: () => navigate('/projects'),
      ぷろじぇくと: () => navigate('/projects'),
      案件: () => navigate('/projects'),
      リアルタイム: () => navigate('/realtime'),
      りあるたいむ: () => navigate('/realtime'),
      AI分析: () => navigate('/ai-insights'),
      えーあい分析: () => navigate('/ai-insights'),
      AI: () => navigate('/ai-insights'),
      分析: () => navigate('/ai-insights'),
    };

    // コマンド実行
    let executed = false;
    for (const [key, action] of Object.entries(commands)) {
      if (lowerCommand.includes(key.toLowerCase())) {
        setStatus(`実行: ${key}へ移動`);
        action();
        executed = true;

        // 音声フィードバック
        const utterance = new SpeechSynthesisUtterance(`${key}を表示します`);
        utterance.lang = 'ja-JP';
        speechSynthesis.speak(utterance);
        break;
      }
    }

    if (!executed) {
      setStatus('コマンドが認識できませんでした');
      const utterance = new SpeechSynthesisUtterance('すみません、コマンドが認識できませんでした');
      utterance.lang = 'ja-JP';
      speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* 音声コマンドボタン */}
      <button
        onClick={toggleListening}
        className={`p-4 rounded-full shadow-lg transition-all transform hover:scale-110 ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isListening ? (
          <MicOff className="h-6 w-6 text-white" />
        ) : (
          <Mic className="h-6 w-6 text-white" />
        )}
      </button>

      {/* ステータス表示 */}
      {(isListening || transcript) && (
        <div className="absolute bottom-20 right-0 bg-white rounded-lg shadow-xl p-4 w-80 animate-fade-in">
          <div className="mb-2">
            <p className="text-xs text-gray-500">ステータス</p>
            <p className="text-sm font-medium">{status}</p>
          </div>
          {transcript && (
            <div>
              <p className="text-xs text-gray-500">認識テキスト</p>
              <p className="text-sm">{transcript}</p>
            </div>
          )}
          <div className="mt-3 text-xs text-gray-400">
            <p>使用可能なコマンド:</p>
            <ul className="mt-1 space-y-1">
              <li>• 「ダッシュボード」「ホーム」</li>
              <li>• 「地図」「マップ」</li>
              <li>• 「プロジェクト」「案件」</li>
              <li>• 「リアルタイム」</li>
              <li>• 「AI分析」「分析」</li>
            </ul>
          </div>
        </div>
      )}

      {/* ヘルプチップ */}
      {!isListening && (
        <div className="absolute bottom-0 right-20 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 hover:opacity-100 transition-opacity">
          音声コマンド
        </div>
      )}
    </div>
  );
}
