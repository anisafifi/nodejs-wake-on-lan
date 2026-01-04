'use client';

import { useState, useEffect } from 'react';
import { api, Device } from '@/lib/api';
import DeviceCard from '@/components/DeviceCard';
import DeviceModal from '@/components/DeviceModal';
import { Plus, Wifi, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [wakingDevices, setWakingDevices] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | undefined>();
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const data = await api.getDevices();
      setDevices(data.devices);
    } catch (error) {
      showNotification('error', 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleWake = async (device: Device) => {
    setWakingDevices(prev => new Set(prev).add(device.name));
    try {
      const result = await api.wakeDevice(device.name);
      showNotification(result.success ? 'success' : 'error', result.message);
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'Failed to wake device');
    } finally {
      setWakingDevices(prev => {
        const next = new Set(prev);
        next.delete(device.name);
        return next;
      });
    }
  };

  const handleWakeAll = async () => {
    if (devices.length === 0) return;
    
    try {
      const result = await api.wakeAll();
      showNotification(
        'success',
        `Woke ${result.summary.successful}/${result.summary.total} devices`
      );
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'Failed to wake devices');
    }
  };

  const handleSaveDevice = async (device: Device) => {
    try {
      if (editingDevice && !isDuplicating) {
        await api.updateDevice(editingDevice.name, device);
        showNotification('success', 'Device updated successfully');
      } else {
        await api.addDevice(device);
        showNotification('success', 'Device added successfully');
      }
      setShowModal(false);
      setEditingDevice(undefined);
      setIsDuplicating(false);
      loadDevices();
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'Failed to save device');
    }
  };

  const handleDeleteDevice = async (device: Device) => {
    if (!confirm(`Delete ${device.name}?`)) return;
    
    try {
      await api.deleteDevice(device.name);
      showNotification('success', 'Device deleted successfully');
      loadDevices();
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'Failed to delete device');
    }
  };

  const handleEditDevice = (device: Device) => {
    setEditingDevice(device);
    setIsDuplicating(false);
    setShowModal(true);
  };

  const handleDuplicateDevice = (device: Device) => {
    // Create a copy with modified name
    const duplicatedDevice: Device = {
      ...device,
      name: `${device.name} (copy)`,
    };
    setEditingDevice(duplicatedDevice);
    setIsDuplicating(true);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Wake-on-LAN Controller
            </h1>
            <div className="flex gap-3">
              {devices.length > 0 && (
                <button
                  onClick={handleWakeAll}
                  className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  <Wifi className="w-5 h-5" />
                  Wake All
                </button>
              )}
              <button
                onClick={() => {
                  setEditingDevice(undefined);
                  setIsDuplicating(false);
                  setShowModal(true);
                }}
                className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Device
              </button>
            </div>
          </div>
        </div>
      </header>

      {notification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div
            className={`flex items-center gap-3 p-4 rounded-lg ${
              notification.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading devices...</p>
          </div>
        ) : devices.length === 0 ? (
          <div className="text-center py-12">
            <Wifi className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              No devices configured
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add your first device to get started
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Device
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device) => (
              <DeviceCard
                key={device.name}
                device={device}
                onWake={handleWake}
                onEdit={handleEditDevice}
                onDuplicate={handleDuplicateDevice}
                onDelete={handleDeleteDevice}
                isWaking={wakingDevices.has(device.name)}
              />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <DeviceModal
          device={editingDevice}
          onSave={handleSaveDevice}
          onClose={() => {
            setShowModal(false);
            setEditingDevice(undefined);
            setIsDuplicating(false);
          }}
        />
      )}
    </div>
  );
}
