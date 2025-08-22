import React, { useState } from 'react';
import { Task } from '../types';
import { Edit2, Trash2, Check, X, Plus } from 'lucide-react';

interface TaskManagerProps {
  tasks: Task[];
  onUpdateTasks: (tasks: Task[]) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({ tasks, onUpdateTasks }) => {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const handleSaveTask = (updatedTask: Task) => {
    if (!updatedTask) {
      console.error('Tentativa de salvar task null');
      return;
    }

    const updatedTasks = tasks.map(task =>
      task.id === updatedTask.id ? updatedTask : task
    );
    onUpdateTasks(updatedTasks);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    onUpdateTasks(updatedTasks);
  };

  const handleAddTask = () => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: 'Nova Task',
      description: 'Descrição da nova task',
      storyPoints: 1,
      status: 'pending',
      category: 'Funcional'
    };
    onUpdateTasks([...tasks, newTask]);
    setIsAddingTask(false);
    setEditingTask(newTask);
  };

  const handleStatusChange = (taskId: string, status: Task['status']) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, status } : task
    );
    onUpdateTasks(updatedTasks);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Tasks do Projeto ({tasks.length})
        </h2>
        <button
          onClick={() => setIsAddingTask(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Task
        </button>
      </div>

      {isAddingTask && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 mb-3">
            Clique no botão abaixo para adicionar uma nova task:
          </p>
          <button
            onClick={handleAddTask}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Confirmar Adição
          </button>
          <button
            onClick={() => setIsAddingTask(false)}
            className="ml-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Nenhuma task gerada ainda.</p>
          <p className="text-sm mt-2">
            Faça upload de documentos e clique em "Gerar Escopo e Tasks" para criar as tasks.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="border border-gray-200 rounded-lg p-4">
              {editingTask?.id === task.id && editingTask ? (
                <TaskEditor
                  task={editingTask}
                  onSave={handleSaveTask}
                  onCancel={() => setEditingTask(null)}
                />
              ) : (
                <TaskCard
                  task={task}
                  onEdit={() => handleEditTask(task)}
                  onDelete={() => handleDeleteTask(task.id)}
                  onStatusChange={(status) => handleStatusChange(task.id, status)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: Task['status']) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusChange }) => {
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };



  return (
    <div>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={onEdit}
            className="p-1 text-blue-600 hover:text-blue-800"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-red-600 hover:text-red-800"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            {task.storyPoints} {task.storyPoints === 1 ? 'ponto' : 'pontos'}
          </span>
          <span className="text-sm text-gray-500">{task.category}</span>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={task.status}
            onChange={(e) => onStatusChange(e.target.value as Task['status'])}
            className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(task.status)}`}
          >
            <option value="pending">Pendente</option>
            <option value="approved">Aprovada</option>
            <option value="rejected">Rejeitada</option>
          </select>
        </div>
      </div>
    </div>
  );
};

interface TaskEditorProps {
  task: Task;
  onSave: (task: Task) => void;
  onCancel: () => void;
}

const TaskEditor: React.FC<TaskEditorProps> = ({ task, onSave, onCancel }) => {
  const [editedTask, setEditedTask] = useState(task);

  const handleSave = () => {
    onSave(editedTask);
  };

  // Verificação de segurança caso task seja null
  if (!task) {
    return (
      <div className="text-center py-4 text-red-600">
        Erro: Task não encontrada para edição.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título
        </label>
        <input
          type="text"
          value={editedTask.title}
          onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descrição
        </label>
        <textarea
          value={editedTask.description}
          onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Story Points
          </label>
          <select
            value={editedTask.storyPoints}
            onChange={(e) => setEditedTask({ ...editedTask, storyPoints: parseInt(e.target.value) })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={1}>1 ponto</option>
            <option value={2}>2 pontos</option>
            <option value={3}>3 pontos</option>
            <option value={5}>5 pontos</option>
            <option value={8}>8 pontos</option>
            <option value={13}>13 pontos</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria
          </label>
          <input
            type="text"
            value={editedTask.category}
            onChange={(e) => setEditedTask({ ...editedTask, category: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          onClick={onCancel}
          className="flex items-center px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
        >
          <X className="w-4 h-4 mr-1" />
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Check className="w-4 h-4 mr-1" />
          Salvar
        </button>
      </div>
    </div>
  );
};
