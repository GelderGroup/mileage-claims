# Mileage Claims Application - Architecture Documentation

## Overview

This document outlines the clean architecture implementation for the Mileage Claims application, built with re:dom framework and following separation of concerns principles.

## 🏗️ Architecture Dependency Graph

```
┌─────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYERS                       │
└─────────────────────────────────────────────────────────────────┘

🎨 PRESENTATION LAYER
┌───────────────────────────────────────┐
│            MileageModal               │  ← Pure UI Component
│  ┌─────────────────────────────────┐  │
│  │ • PostcodeInput components      │  │
│  │ • DateInput component           │  │
│  │ • CalculateButton component     │  │
│  │ • HTML structure (dialog)       │  │
│  │ • CSS styling                   │  │
│  └─────────────────────────────────┘  │
└───────────────────────────────────────┘
              │ controls
              ▼
🔧 APPLICATION LAYER
┌───────────────────────────────────────┐
│        MileageEntryController         │  ← Business Logic Orchestrator
│  ┌─────────────────────────────────┐  │
│  │ • Event handling (all clicks)   │  │
│  │ • Form validation               │  │
│  │ • Data collection & formatting  │  │
│  │ • Loading states                │  │
│  │ • Error handling                │  │
│  └─────────────────────────────────┘  │
└───────────────────────────────────────┘
              │ uses
              ▼
🏗️ INFRASTRUCTURE LAYER
┌───────────────────────────────────────┐      ┌─────────────────────┐
│          ModalManager                 │      │   MileageService    │
│  ┌─────────────────────────────────┐  │      │  ┌───────────────┐  │
│  │ • DOM mount/unmount             │  │      │  │ • Geolocation │  │
│  │ • Animation timing              │  │ ->   │  │ • Distance    │  │
│  │ • Scrollbar compensation        │  │      │  │ • Validation  │  │
│  │ • ESC key prevention            │  │      │  │ • Formatting  │  │
│  │ • Browser behavior              │  │      │  └───────────────┘  │
│  └─────────────────────────────────┘  │      └─────────────────────┘
└───────────────────────────────────────┘
```

## 🔄 Component Knowledge Matrix

| Component                     | Knows About                                                                                                                       | Does NOT Know About                                                 |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **🎨 MileageModal**           | • Own UI components<br>• MileageEntryController reference<br>• ModalManager (open/close)<br>• Public callbacks (onSave, onCancel) | • Business logic<br>• Validation rules<br>• Service operations      |
| **🔧 MileageEntryController** | • MileageModal reference<br>• MileageService<br>• Form field structure<br>• Event handling patterns<br>• Validation rules         | • Modal infrastructure<br>• DOM manipulation<br>• Animation details |
| **🏗️ ModalManager**           | • DOM manipulation<br>• CSS animation classes<br>• Browser behavior<br>• Modal lifecycle                                          | • Business logic<br>• Form structure<br>• Validation rules          |
| **📊 MileageService**         | • External APIs<br>• Data validation<br>• Formatting standards<br>• Business rules                                                | • UI components<br>• Modal behavior<br>• Event handling             |

## 🔀 Interaction Flow Example

**User Action: "Click Calculate Button"**

```
┌─────────────┐    DOM Event     ┌────────────────────────────┐
│ Browser DOM │ ───────────────▶│   MileageEntryController   │
└─────────────┘                  │                            │
                                 │ 1. handleMileageCalculation│
                                 │ 2. Get form values         │
                                 │ 3. Call MileageService     │
                                 └────────────┬───────────────┘
                                              │
                                              ▼
                                 ┌────────────────────────────┐
                                 │      MileageService        │
                                 │                            │
                                 │ 1. Validate postcodes      │
                                 │ 2. Calculate distance      │
                                 │ 3. Return miles            │
                                 └────────────┬───────────────┘
                                              │
                                              ▼
┌─────────────┐    Update UI     ┌────────────────────────────┐
│ Browser DOM │ ◀────────────────│   MileageEntryController   │
└─────────────┘                  │                            │
                                 │ 1. Update miles input      │
                                 │ 2. Handle errors           │
                                 │ 3. Manage loading state    │
                                 └────────────────────────────┘
```

## 🎯 Dependency Direction (Clean Architecture)

```
High Level (UI)
      │
      ▼
🎨 MileageModal
      │ depends on
      ▼
🔧 MileageEntryController ────┐
      │                      │ depends on
      │ depends on           ▼
      ▼                 📊 MileageService
🏗️ ModalManager              │
      │                      │ depends on
      │ depends on           ▼
      ▼                 🌐 External APIs
🌍 Browser APIs         (Geolocation, etc.)
```

## 📁 File Structure

```
src/
├── js/
│   ├── Components/
│   │   ├── MileageModal/
│   │   │   ├── index.js          ← UI Component
│   │   │   └── index.css
│   │   ├── PostcodeInput/
│   │   ├── DateInput/
│   │   └── CalculateButton/
│   ├── controllers/
│   │   └── MileageEntryController/
│   │       └── index.js          ← Business Logic
│   ├── services/
│   │   └── mileageService.js     ← Domain Services
│   └── utils/
│       └── modalManager.js       ← Infrastructure
```

## 🧪 Testing Strategy

### Unit Testing by Layer

1. **MileageService**: Test business logic in isolation

   ```javascript
   expect(MileageService.validateMileageEntry(invalidData).isValid).toBe(false);
   ```

2. **MileageEntryController**: Test with mocked modal component

   ```javascript
   const mockModal = { startPostcodeInput: { value: 'SW1A' }, ... };
   const controller = new MileageEntryController(mockModal);
   ```

3. **MileageModal**: Test UI rendering with mocked controller

   ```javascript
   const mockController = { setupEventListeners: jest.fn() };
   ```

4. **ModalManager**: Test DOM manipulation independently
   ```javascript
   const mockComponent = { el: document.createElement("dialog") };
   ```

## 💡 Key Architectural Principles

### 1. Single Responsibility Principle (SRP)

- **MileageModal**: Renders UI only
- **MileageEntryController**: Handles all user interactions
- **ModalManager**: Manages modal infrastructure
- **MileageService**: Handles business operations

### 2. Dependency Inversion Principle (DIP)

- High-level modules don't depend on low-level modules
- Both depend on abstractions (interfaces)
- Dependencies flow inward toward business logic

### 3. Open/Closed Principle (OCP)

- Easy to extend with new form types (create new controllers)
- Easy to change UI without affecting business logic
- Easy to swap services without changing controllers

### 4. Interface Segregation Principle (ISP)

- Each component has a focused, minimal API
- No component is forced to depend on methods it doesn't use

## 🚀 Benefits Achieved

1. **Maintainability**: Clear separation makes changes predictable
2. **Testability**: Each layer can be tested in isolation
3. **Reusability**: Components can be reused with different controllers
4. **Scalability**: Easy to add new features without breaking existing code
5. **Readability**: Clear responsibilities make code self-documenting

## 🔄 Future Extensions

### Adding a New Form Type

1. Create new UI component (e.g., `ExpenseModal`)
2. Create new controller (e.g., `ExpenseEntryController`)
3. Reuse existing infrastructure (`ModalManager`)
4. Create new service if needed (e.g., `ExpenseService`)

### Adding New Features

- **Loading spinners**: Extend controller's `setLoadingState`
- **Field validation**: Extend service validation methods
- **New input types**: Create new input components
- **Different modal styles**: Create new modal components

---

_Generated: October 31, 2025_  
_Framework: re:dom_  
_Architecture: Clean Architecture with Dependency Inversion_
