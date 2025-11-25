import React, { useRef, useState } from 'react';
import { Send, Paperclip, X, Image as ImageIcon, FileText, Music, Video, File } from 'lucide-react';
import { Attachment } from '../types';

interface InputAreaProps {
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if ((!text.trim() && attachments.length === 0) || isLoading) return;
    onSendMessage(text, attachments);
    setText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setAttachments(prev => [...prev, {
              file,
              previewUrl: URL.createObjectURL(file),
              base64: event.target.result as string,
              mimeType: file.type
            }]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-8 h-8" />;
    if (mimeType === 'application/pdf') return <FileText className="w-8 h-8" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-8 h-8" />;
    if (mimeType.startsWith('video/')) return <Video className="w-8 h-8" />;
    if (mimeType.startsWith('text/')) return <FileText className="w-8 h-8" />;
    return <File className="w-8 h-8" />;
  };

  const isImageFile = (mimeType: string) => mimeType.startsWith('image/');

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4 bg-gray-900 border-t border-gray-800">
      <div className="max-w-4xl mx-auto">

        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="flex gap-3 mb-3 overflow-x-auto pb-2">
            {attachments.map((att, i) => (
              <div key={i} className="relative group shrink-0">
                {isImageFile(att.mimeType) ? (
                  <img
                    src={att.previewUrl}
                    alt="preview"
                    className="w-20 h-20 object-cover rounded-lg border border-gray-700"
                  />
                ) : (
                  <div className="w-20 h-20 flex flex-col items-center justify-center bg-gray-800 rounded-lg border border-gray-700 text-gray-400">
                    {getFileIcon(att.mimeType)}
                    <span className="text-[10px] mt-1 truncate w-full px-1 text-center">
                      {att.file.name.split('.').pop()?.toUpperCase()}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => removeAttachment(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative flex items-end gap-2 bg-gray-800 p-2 rounded-xl border border-gray-700 focus-within:ring-2 focus-within:ring-primary-500/50 transition-all">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Add attachment"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="file"
            multiple
            accept="image/*,application/pdf,audio/*,video/*,text/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              handleResize();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            className="w-full bg-transparent text-gray-100 placeholder-gray-500 resize-none outline-none py-2 max-h-[200px] overflow-y-auto"
            rows={1}
          />

          <button
            onClick={handleSend}
            disabled={(!text.trim() && attachments.length === 0) || isLoading}
            className={`p-2 rounded-lg transition-all ${(!text.trim() && attachments.length === 0) || isLoading
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-500 shadow-lg shadow-primary-500/20'
              }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center mt-2">
          <p className="text-xs text-gray-500">
            Chota Architect may display inaccurate info, including about people, so double-check its responses.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InputArea;