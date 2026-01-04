'use client';

import { Device } from '@/lib/api';
import { Wifi, WifiOff, Trash2, Edit2, Copy } from 'lucide-react';

interface DeviceCardProps {
  device: Device;
  onWake: (device: Device) => void;
  onEdit: (device: Device) => void;
  onDuplicate: (device: Device) => void;
  onDelete: (device: Device) => void;
  isWaking?: boolean;
}

export default function DeviceCard({ device, onWake, onEdit, onDuplicate, onDelete, isWaking }: DeviceCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {device.name}
          </h3>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <p className="font-mono">MAC: {device.mac}</p>
            {device.ip && <p>IP: {device.ip}</p>}
            {device.broadcast && <p>Broadcast: {device.broadcast}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(device)}
            className="p-2 cursor-pointer text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title="Edit device"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDuplicate(device)}
            className="p-2 cursor-pointer text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
            title="Duplicate device"
          >
            <Copy className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(device)}
            className="p-2 cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            title="Delete device"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <button
        onClick={() => onWake(device)}
        disabled={isWaking}
        className="w-full flex items-center cursor-pointer justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
      >
        {isWaking ? (
          <>
            <WifiOff className="w-5 h-5 animate-pulse" />
            <span>Waking...</span>
          </>
        ) : (
          <>
            <Wifi className="w-5 h-5" />
            <span>Wake Device</span>
          </>
        )}
      </button>
    </div>
  );
}
