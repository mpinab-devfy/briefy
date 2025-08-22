import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentFile } from '../types';
import { Upload, X, FileText, Video, File } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (files: DocumentFile[]) => void;
  onRemoveFile: (fileId: string) => void;
  uploadedFiles: DocumentFile[];
}

const getFileIcon = (type: string) => {
  switch (type) {
    case 'md':
      return <FileText className="w-6 h-6 text-blue-500" />;
    case 'video':
      return <Video className="w-6 h-6 text-red-500" />;
    default:
      return <File className="w-6 h-6 text-gray-500" />;
  }
};

const getFileType = (fileName: string): 'md' | 'pdf' | 'docx' | 'video' => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'md':
      return 'md';
    case 'pdf':
      return 'pdf';
    case 'docx':
      return 'docx';
    case 'mp4':
    case 'mov':
    case 'avi':
    case 'mkv':
      return 'video';
    default:
      return 'md'; // Default to markdown
  }
};

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  onRemoveFile,
  uploadedFiles
}) => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: DocumentFile[] = [];

    for (const file of acceptedFiles) {
      try {
        const content = await file.text(); // Para MVP, apenas texto
        const documentFile: DocumentFile = {
          id: `${Date.now()}-${file.name}`,
          name: file.name,
          type: getFileType(file.name),
          content: content,
          url: file.type.startsWith('video/') ? URL.createObjectURL(file) : undefined
        };
        newFiles.push(documentFile);
      } catch (error) {
        console.error('Erro ao processar arquivo:', error);
      }
    }

    onFileUpload(newFiles);
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/markdown': ['.md'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'video/*': ['.mp4', '.mov', '.avi', '.mkv']
    },
    maxFiles: 10
  });

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          {isDragActive ? 'Solte os arquivos aqui' : 'Arraste e solte arquivos aqui'}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          ou clique para selecionar arquivos
        </p>
        <p className="text-xs text-gray-400">
          Suportados: MD, PDF, DOCX, Vídeos (MP4, MOV, AVI, MKV)
        </p>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Arquivos Carregados ({uploadedFiles.length})
          </h3>
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.type)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500 uppercase">{file.type}</p>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveFile(file.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
