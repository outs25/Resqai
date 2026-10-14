---
name: My design system
colors:
  surface: '#f9f9ff'
  surface-dim: '#d7dae3'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3fc'
  surface-container: '#ebedf7'
  surface-container-high: '#e6e8f1'
  surface-container-highest: '#e0e2eb'
  on-surface: '#181c22'
  on-surface-variant: '#414753'
  inverse-surface: '#2d3037'
  inverse-on-surface: '#eef0fa'
  outline: '#717785'
  outline-variant: '#c1c6d5'
  surface-tint: '#005db8'
  primary: '#005cb8'
  on-primary: '#ffffff'
  primary-container: '#1275e2'
  on-primary-container: '#000512'
  inverse-primary: '#aac7ff'
  secondary: '#465f88'
  on-secondary: '#ffffff'
  secondary-container: '#b6d0ff'
  on-secondary-container: '#3f5881'
  tertiary: '#9a4600'
  on-tertiary: '#ffffff'
  tertiary-container: '#c05900'
  on-tertiary-container: '#0d0300'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#aac7ff'
  on-primary-fixed: '#001b3e'
  on-primary-fixed-variant: '#00458d'
  secondary-fixed: '#d6e3ff'
  secondary-fixed-dim: '#aec7f7'
  on-secondary-fixed: '#001b3d'
  on-secondary-fixed-variant: '#2d476f'
  tertiary-fixed: '#ffdbc9'
  tertiary-fixed-dim: '#ffb68c'
  on-tertiary-fixed: '#321200'
  on-tertiary-fixed-variant: '#763400'
  background: '#f9f9ff'
  on-background: '#181c22'
  surface-variant: '#e0e2eb'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

# Design System

## Brand & Style
The design system adopts a **Corporate / Modern** style, characterized by a clean, reliable, and professional aesthetic using the **Inter** typeface family. The overarching tone is trustworthy and efficient, built for modern digital workflows.

## Colors
The color palette is built for clarity and high accessibility in a light color mode:
- **Primary (`#1275e2`)**: A vibrant, dependable blue used for primary actions, key interactive elements, and focal points.
- **Secondary (`#5f78a3`)**: A muted slate-blue providing balanced support for secondary components and tags.
- **Tertiary (`#c55b00`)**: A warm orange accent used sparingly for calls to action or notifications.
- **Neutral (`#74777f`)**: A cool grey providing robust contrast for text and surface structures.

## Typography
All text elements utilize **Inter** to ensure maximum legibility and a modern, neutral tone across all platforms. Headings feature heavier weights for strong hierarchy, while body and label styles prioritize clean readability at smaller scales.

## Layout & Spacing
Utilizes a standard fluid grid system with structured margins (`1.5rem`) and consistent gutters (`1rem`). Spacing scales from `0.25rem` up to `2rem` to maintain airy, readable layouts without clutter.

## Elevation & Depth
Depth is established primarily through tonal layers and subtle ambient shadows, creating clear spatial separation without heavy visual noise.

## Shapes
The design system employs a **Rounded** shape language (`roundedness: 2`). Standard UI elements feature a `0.5rem` corner radius, while larger containers scale up to `1rem` and `1.5rem`, providing an approachable and modern feel.

## Components
Components leverage the rounded shape language and primary blue tones for interactive states. Buttons feature solid primary fills with rounded corners, inputs utilize clean neutral borders with primary focus states, and cards provide soft container surfaces with subtle elevation.