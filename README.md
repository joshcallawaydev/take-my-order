# Take My Order

A playful webapp for my 7-year-old daughter, Zara, to run her own drive-through in her playhouse!

## Project Purpose

This is a simple, one-page web application designed for children to play "drive-through" at home. The app allows Zara to take orders, assign order numbers, and notify when an order is ready with a fun sound. It's meant to be intuitive, colorful, and easy for a child to use.

## Features

- **Order Taking:**  
  - Enter the customer's name.
  - Select items to order (e.g., burgers, fries, drinks—customizable).
  - Click "Add Order" to submit.

- **Order Management:**  
  - Each order receives a unique order number.
  - Orders appear in a list with:
    - Customer name
    - Ordered items
    - Order number
    - Countdown timer until the order is ready

- **Order Ready Notification:**  
  - When the timer reaches zero, the app plays a "bing" sound to alert that the order is ready.

- **Order Removal:**  
  - Each order in the list has a delete button to remove it once completed.

## User Experience

- **One-page app:** All interactions happen on a single screen.
- **Kid-friendly:** Large buttons, clear labels, and fun colors.
- **No authentication or backend required:** All state can be managed in-memory for simplicity.

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run the development server:**
   ```bash
   npm run dev
   ```
3. **Open your browser:**  
   Visit [http://localhost:3000](http://localhost:3000) to use the app.

## Customization

- **Menu Items:**  
  You can easily change the available order items in the code to match Zara's favorite foods.

- **Order Ready Sound:**  
  Place a `bing.mp3` or similar sound file in the `public/` directory and update the code to use it.

## Tech Stack

- [Next.js](https://nextjs.org/) (React framework)
- TypeScript
- CSS Modules

## Future Ideas

- Add images for menu items
- Allow custom timer durations
- Save orders in local storage
