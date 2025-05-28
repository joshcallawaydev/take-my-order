'use client'
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./page.module.css";

// Example menu items (customize as needed)
const MENU_ITEMS = [
  { id: "burger", label: "Burger" },
  { id: "fries", label: "Fries" },
  { id: "pizza", label: "Pizza" },
  { id: "pie", label: "Pie" },
  { id: "chips", label: "Chips" },
  { id: "hotdog", label: "Hot Dog" },
  { id: "nuggets", label: "Nuggets" },
  { id: "icecream", label: "Ice Cream" },
  { id: "drink", label: "Drink" },
];

export default function Home() {
  const [name, setName] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderCounter, setOrderCounter] = useState(1);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context on first user interaction
  const initializeAudio = async () => {
    if (!audioEnabled) {
      try {
        // Initialize Web Audio Context
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioContextRef.current = new AudioContextClass();
          if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
          }
        }

        // Try to load and prepare the audio element
        if (audioRef.current) {
          try {
            await audioRef.current.load();
            // Test play and immediately pause to "unlock" audio
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
              await playPromise;
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
          } catch (error) {
            console.log('Audio element initialization failed, will use Web Audio API');
          }
        }

        setAudioEnabled(true);
        console.log('Audio initialized successfully');
      } catch (error) {
        console.log('Audio initialization failed:', error);
      }
    }
  };

  // Create a beep sound using Web Audio API as fallback
  const playBeep = async () => {
    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.frequency.value = 800; // Frequency in Hz
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.5);
      
      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + 0.5);
    } catch (error) {
      console.log('Could not play audio notification:', error);
    }
  };

  // Play notification sound
  const playNotification = async () => {
    if (!audioEnabled) {
      console.log('Audio not enabled - user interaction required first');
      return;
    }

    // Try Web Audio API first (most reliable)
    try {
      await playBeep();
    } catch (error) {
      // If Web Audio fails, try the audio element
      if (audioRef.current) {
        try {
          audioRef.current.currentTime = 0;
          await audioRef.current.play();
        } catch (error) {
          console.log('All audio methods failed:', error);
        }
      }
    }
  };

  // Handle menu item selection and initialize audio on first interaction
  const toggleItem = async (itemId: string) => {
    await initializeAudio();
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Add new order and initialize audio
  const addOrder = async () => {
    if (!name || selectedItems.length === 0) return;
    
    await initializeAudio();
    
    setOrders((prev) => [
      ...prev,
      {
        id: orderCounter,
        name,
        items: selectedItems,
        timer: 60, // 1 minute in seconds
        ready: false,
        dinged: false,
      },
    ]);
    setOrderCounter((c) => c + 1);
    setName("");
    setSelectedItems([]);
  };

  // Delete order
  const deleteOrder = (id: number) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
  };

  // Countdown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders((prevOrders: any[]) =>
        prevOrders.map((order) => {
          if (order.ready || order.timer === 0) return order;
          return { ...order, timer: order.timer - 1 };
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Play sound when order is ready
  useEffect(() => {
    orders.forEach((order) => {
      if (order.timer === 0 && !order.ready && !order.dinged) {
        playNotification();
        setOrders((prevOrders: any[]) =>
          prevOrders.map((o) =>
            o.id === order.id ? { ...o, ready: true, dinged: true } : o
          )
        );
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  // Format timer as mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Take My Order</h1>
      {!audioEnabled && (
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          padding: '12px',
          margin: '0 auto 20px auto',
          maxWidth: '600px',
          textAlign: 'center',
          color: '#856404'
        }}>
          🔊 Click any button to enable audio notifications
        </div>
      )}
      <section className={styles.orderForm}>
        <h2>New Order</h2>
        <input
          type="text"
          placeholder="Customer name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={initializeAudio}
          className={styles.input}
        />
        <div className={styles.menuItems}>
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              className={
                selectedItems.includes(item.id)
                  ? styles.menuItemSelected
                  : styles.menuItem
              }
              onClick={() => toggleItem(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          className={styles.addOrderBtn}
          onClick={addOrder}
          disabled={!name || selectedItems.length === 0}
        >
          Add Order
        </button>
      </section>

      <section className={styles.ordersList}>
        <h2>Orders</h2>
        {orders.length === 0 && <p>No orders yet!</p>}
        <ul>
          {orders.map((order) => (
            <li key={order.id} className={`${styles.orderItem} ${order.ready ? styles.orderItemReady : ''}`}>
              <span className={styles.orderNumber}>#{order.id}</span>
              <span className={styles.orderName}>{order.name}</span>
              <span className={styles.orderItems}>
                {order.items.map((itemId: string) =>
                  MENU_ITEMS.find((i) => i.id === itemId)?.label
                ).join(", ")}
              </span>
              <span className={`${styles.orderTimer} ${order.ready ? styles.orderTimerReady : ''}`}>{formatTime(order.timer)}</span>
              <button
                className={styles.deleteOrderBtn}
                onClick={() => deleteOrder(order.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
      {/* Audio element for 'ding' sound with error handling */}
      <audio 
        ref={audioRef} 
        preload="metadata"
        playsInline
        muted={false}
        onError={() => console.log('Audio file failed to load, using fallback beep')}
        onCanPlayThrough={() => console.log('Audio file loaded successfully')}
      >
        <source src="/notification.aiff" type="audio/aiff" />
        <source src="/notification.mp3" type="audio/mpeg" />
        <source src="/notification.wav" type="audio/wav" />
        <source src="/notification.ogg" type="audio/ogg" />
      </audio>
    </div>
  );
}
