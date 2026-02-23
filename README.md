# Gauge

Gauge is a sleek, focus and task management application designed to help you break down goals, track your focus sessions, and visualize your productivity over time. Built with React and tailored for a fluid user experience.

## Features

- **Task Management**
  - Create tasks with custom titles, descriptions, priorities, and tags.
  - Set a specific **Focus Goal** (in minutes) for each task.
  - Quick keyboard shortcuts to navigate (Press `N` to add a task, `T` for Tasks, `F` for Focus, `S` for Stats).

- **Dynamic Focus Timer**
  - **Smooth Tracking:** A fluid, 60fps rotating progress dot using `requestAnimationFrame`.
  - **Color-Shifting Ring:** The progress ring interpolates smoothly from Green to Amber to Orange to Red as you approach and exceed your focus goal.
  - **Cumulative Time:** Pause and resume freely; the timer tracks your total accumulated time on a task.
  - **Overtime Notifications:** Get a single, non-intrusive toast notification the moment you hit your focus goal.

- **Statistics & Analytics**
  - **Focus Activity Chart:** View your productivity with toggleable **Daily** (current week) and **Weekly** (last 8 weeks) views.
  - **Activity Heatmap:** Github-style contribution heatmap based on your daily focus history.
  - **Streaks:** Automatically tracks your daily focus streak.
  - **Most Focused Task:** Highlights the task you spent the most time on.

## Tech Stack

- **Framework:** React
- **Styling:** Tailwind CSS v4 + native CSS
- **Charts:** Recharts
- **Icons:** Lucide React
- **Notifications:** Sonner

## Getting Started

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd Gauge
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run the development server:**

   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Keyboard Shortcuts

- `N` - Open "New Task" modal
- `T` - Switch to Tasks view
- `F` - Switch to Focus view
- `S` - Switch to Stats view
- `Space` - Play/Pause the active focus timer

## License

MIT
