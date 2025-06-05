# Air Pollution Dispersion Model

## Project Overview
This project simulates and visualizes air pollution dispersion from a smoke stack using a Gaussian distribution model. Users can interact with the simulation by adjusting various stack and environmental parameters to observe their impact on the plume's behavior in real-time. The visualization is rendered on an HTML canvas.

## Key Features
- Interactive visualization of a smoke plume.
- Adjustable parameters for:
    - **Stack:** Physical height, diameter, exit velocity, gas temperature, pollutant emission rate. (Stack X position is fixed for now).
    - **Environment:** Ambient temperature, wind velocity, wind direction (parameter stored, visual rotation pending), atmospheric stability class, background pollution concentration.
- Visual representation of ground, sky, and clouds.
- Real-time updates to the visualization based on parameter changes.
- Point-specific concentration check: Input X, Y, Z coordinates to get the calculated concentration at that point (includes background concentration).
- Grayscale plume rendering based on concentration intensity.

## Architecture
The application follows a Model-View-Controller (MVC) pattern:

-   **`model.js` (Model):**
    -   Manages all simulation data, including default stack and environmental conditions, and pollutant concentrations.
    -   Contains the core logic for pollution dispersion calculations (Gaussian model, Briggs plume rise equations, dispersion coefficients interpolation).
    -   Does not interact directly with the DOM.
-   **`view.js` (View):
    -   Responsible for rendering the visual representation of the simulation on the HTML canvas based on data from the Model (passed via Controller).
    -   Handles all DOM manipulations related to the visualization (stack, plume, ground, sky, clouds, scales).
-   **`controller.js` (Controller):**
    -   Acts as the intermediary between the Model and the View.
    -   Handles user inputs from the HTML interface (parameter changes, point concentration checks).
    -   Updates the application state (current stack and environment parameters).
    -   Requests data from the Model (e.g., concentration calculations).
    -   Instructs the View to re-render when the state changes or new data is available.

## Development Roadmap

### Phase 1: Core Functionality & Architectural Refinement
-   [x] **Refine MVC Structure:** Fully segregated `model.js`, `view.js`, and `controller.js` responsibilities. `model.js` now contains all core simulation logic.
-   [x] **Smoke Engine Logic:** Core Gaussian calculation implemented in `model.js`.
-   [x] **Complete Smoke Rendering:**
    -   [x] Implement plume rise calculations (e.g., Briggs equations). (Basic implementation in `model.js`; further refinement for stable conditions/momentum plumes is a Phase 3 item).
    -   [x] Define and apply boundary conditions (ground reflection included in Gaussian formula).
    -   [x] Use a grayscale gradient or color map for smoke concentration visualization.
-   [x] **Cloud Rendering:** Basic cloud rendering implemented.
-   [x] **Controller Implementation:**
    -   [ ] Enable adding new stacks to the simulation.
    -   [x] Implement controls for changing all key environment and stack parameters.
-   [x] **Point Concentration Check:** Added UI and functionality to check concentration at user-defined X,Y,Z coordinates.

### Phase 2: UI/UX Enhancements & Parameter Validation
-   [x] **User-Friendly Controls:** Implemented HTML controls (sliders, dropdowns, number inputs) for all key parameters with labels and live value displays.
-   [x] **Real-time Feedback:** Visual updates occur immediately upon parameter changes.
-   [ ] **Input Validation:** Add more robust validation for all user inputs in `controller.js` (e.g., preventing non-numeric inputs where numbers are expected, handling extreme values gracefully beyond HTML min/max if necessary).
-   [ ] **Visual Indication of Wind Direction:** Add a visual cue (e.g., compass rose or arrow) on the canvas to show the currently set wind direction.

### Phase 3: Model Refinement & Advanced Features
-   [ ] **Refine Plume Rise Calculations:** Improve Briggs equations in `model.js`, especially for stable conditions and momentum-dominated plumes. Consider different plume rise formulas if needed.
-   [ ] **Refine Dispersion Coefficients (`sigmaY`, `sigmaZ`):** 
    -   [ ] Verify/complete data for Stability Class 'A' in `model.js`.
    -   [ ] Consider alternative methods for `sigmaY`, `sigmaZ` if more precision is needed for specific scenarios (e.g., urban vs. rural, different averaging times).
-   [ ] **Implement Plume Rotation for Wind Direction:** Modify `model.js` or `controller.js` and `view.js` to correctly rotate the plume based on the `windDirection` parameter.
-   [ ] **Inversion Layers:** (Advanced) Model the effect of an atmospheric inversion layer capping vertical dispersion.
-   [ ] **Multiple Pollutant Sources:** Allow users to add and configure multiple stacks. This involves significant changes to state management in `controller.js`, calculation loops, and rendering in `view.js`.
-   [ ] (Optional) **Time Evolution:** Explore adding a time component for dynamic simulations (e.g., changing meteorological conditions over time).
-   [ ] (Optional) **Enhanced Visuals:** Improve the realism and detail of ground, sky, and plume graphics. Add visual representation of the checked concentration point on canvas.

### Phase 4: Documentation & Testing
-   [~] **Code Comments:** Added comments to explain logic in model, view, and controller. Further review for completeness can be done.
-   [~] **`README.md` Update:** This document is being actively updated. Final review for project description, setup, usage, and parameter explanations needed upon feature completion.
-   [ ] **Testing:**
    -   [ ] Conduct thorough manual testing with diverse parameter sets and edge cases.
    -   [ ] (Optional) Implement unit tests for critical calculation functions in `model.js`.

## Skills Utilized
- HTML Canvas API
- CSS for styling
- JavaScript (Object-Oriented Programming, Modules)
- Gaussian dispersion principles & Briggs plume rise equations

## Resources & Inspirations
- [Resize canvas using js](https://stackoverflow.com/questions/9251480/set-canvas-size-using-javascript/9251497)
- [JS OOP](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Object-oriented_JS)
- [Color Picker (for UI ideas)](https://www.w3schools.com/colors/colors_picker.asp)
- [Ellipse in HTML5 canvas](https://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas)
- [Dispersion coefficient reference](http://courses.washington.edu/cee490/DISPCOEF4WP.htm)
- Standard Air Quality Modeling textbooks and EPA guidelines for Gaussian models and Briggs equations.

## Getting Started
1.  Clone this repository.
2.  Open `index.html` in a modern web browser that supports ES6 modules.
3.  Adjust parameters using the UI controls and observe the plume.
4.  Use the "Check Concentration at Point" feature to query specific locations.
