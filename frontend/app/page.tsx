'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { api, Device } from '@/lib/api';
import DeviceCard from '@/components/DeviceCard';
import DeviceModal from '@/components/DeviceModal';
import { Plus, Wifi } from 'lucide-react';

export default function Home() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [wakingDevices, setWakingDevices] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | undefined>();
  const [isDuplicating, setIsDuplicating] = useState(false);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const data = await api.getDevices();
      setDevices(data.devices);
    } catch (error) {
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const handleWake = async (device: Device) => {
    setWakingDevices(prev => new Set(prev).add(device.name));
    try {
      const result = await api.wakeDevice(device.name);
      if (result.success) {
        toast.success(`${device.name} woken successfully`, {
          description: result.message,
        });
      } else {
        toast.error(`Failed to wake ${device.name}`, {
          description: result.message,
        });
      }
    } catch (error) {
      toast.error(`Failed to wake ${device.name}`, {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
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
    
    const toastId = toast.loading('Waking all devices...');
    try {
      const result = await api.wakeAll();
      toast.success(`Successfully woke ${result.summary.successful}/${result.summary.total} devices`, {
        id: toastId,
        description: result.summary.failed > 0 
          ? `${result.summary.failed} device(s) failed to wake`
          : 'All devices woken successfully',
      });
    } catch (error) {
      toast.error('Failed to wake devices', {
        id: toastId,
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleSaveDevice = async (device: Device) => {
    try {
      if (editingDevice && !isDuplicating) {
        await api.updateDevice(editingDevice.name, device);
        toast.success('Device updated successfully', {
          description: `${device.name} has been updated`,
        });
      } else {
        await api.addDevice(device);
        toast.success('Device added successfully', {
          description: `${device.name} has been added to your devices`,
        });
      }
      setShowModal(false);
      setEditingDevice(undefined);
      setIsDuplicating(false);
      loadDevices();
    } catch (error) {
      toast.error('Failed to save device', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleDeleteDevice = async (device: Device) => {
    if (!confirm(`Delete ${device.name}?`)) return;
    
    try {
      await api.deleteDevice(device.name);
      toast.success('Device deleted successfully', {
        description: `${device.name} has been removed`,
      });
      loadDevices();
    } catch (error) {
      toast.error('Failed to delete device', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
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
              WakeSprint
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
