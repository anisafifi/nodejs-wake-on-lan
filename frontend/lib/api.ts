const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Device {
  name: string;
  mac: string;
  ip?: string;
  broadcast?: string;
}

export interface WakeResult {
  success: boolean;
  device: string;
  mac: string;
  message: string;
}

export interface WakeMultipleResponse {
  results: WakeResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

export const api = {
  // Device endpoints
  async getDevices(): Promise<{ devices: Device[]; count: number }> {
    const res = await fetch(`${API_BASE_URL}/api/devices`);
    if (!res.ok) throw new Error('Failed to fetch devices');
    return res.json();
  },

  async getDevice(name: string): Promise<Device> {
    const res = await fetch(`${API_BASE_URL}/api/devices/${name}`);
    if (!res.ok) throw new Error('Device not found');
    return res.json();
  },

  async addDevice(device: Device): Promise<{ message: string; device: Device }> {
    const res = await fetch(`${API_BASE_URL}/api/devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(device),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to add device');
    }
    return res.json();
  },

  async updateDevice(name: string, updates: Partial<Device>): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/api/devices/${name}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to update device');
    }
    return res.json();
  },

  async deleteDevice(name: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/api/devices/${name}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to delete device');
    }
    return res.json();
  },

  // Wake endpoints
  async wakeDevice(name: string): Promise<WakeResult> {
    const res = await fetch(`${API_BASE_URL}/api/wake?device=${encodeURIComponent(name)}`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to wake device');
    }
    return res.json();
  },

  async wakeByMac(mac: string, broadcast?: string): Promise<WakeResult> {
    const url = new URL(`${API_BASE_URL}/api/wake`);
    url.searchParams.set('mac', mac);
    if (broadcast) url.searchParams.set('broadcast', broadcast);
    
    const res = await fetch(url.toString());
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to wake device');
    }
    return res.json();
  },

  async wakeAll(): Promise<WakeMultipleResponse> {
    const res = await fetch(`${API_BASE_URL}/api/wake-all`, {
      method: 'POST',
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to wake devices');
    }
    return res.json();
  },

  async wakeMultiple(devices: string[]): Promise<WakeMultipleResponse & { notFound: string[] }> {
    const res = await fetch(`${API_BASE_URL}/api/wake-multiple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ devices }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to wake devices');
    }
    return res.json();
  },
};
