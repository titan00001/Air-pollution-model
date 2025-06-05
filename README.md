# Air Pollution Dispersion Model

## Project Overview
This project simulates and visualizes air pollution dispersion from a smoke stack using a Gaussian distribution model. Users can interact with the simulation by adjusting various stack and environmental parameters to observe their impact on the plume's behavior in real-time. The visualization is rendered on an HTML canvas.

## Key Features
- Interactive visualization of a smoke plume.
- Adjustable parameters for:
    - **Stack:** Position (x, y), height, opening diameter, gas exit velocity, gas temperature, pollutant emission rate.
    - **Environment:** Ambient temperature, wind speed, atmospheric stability class, cloud cover, background pollution concentration.
- Visual representation of ground, sky, and clouds.
- Real-time updates to the visualization based on parameter changes.

## Architecture
The application follows a Model-View-Controller (MVC) pattern:

-   **`model.js` (Model):**
    -   Manages all simulation data, including the state of stacks, environmental conditions, and pollutant concentrations.
    -   Contains the core logic for pollution dispersion calculations (Gaussian model, plume rise equations).
    -   Does not interact directly with the DOM.
-   **`view.js` (View) (initially `script.js`):**
    -   Responsible for rendering the visual representation of the simulation on the HTML canvas based on data from the Model.
    -   Handles all DOM manipulations related to the visualization.
-   **`controller.js` (Controller):**
    -   Acts as the intermediary between the Model and the View.
    -   Handles user inputs from the HTML interface (e.g., parameter changes).
    -   Updates the Model based on user actions.
    -   Instructs the View to re-render when the Model changes.

## Development Roadmap

### Phase 1: Core Functionality & Architectural Refinement
-   [x] **Refine MVC Structure:** Fully segregated `model.js`, `view.js` (refactored from `script.js`), and `controller.js` responsibilities. `model.js` now contains all core simulation logic.
-   [x] **Smoke Engine:** Initial engine for smoke particle behavior.
-   [ ] **Complete Smoke Rendering:**
    -   [~] Implement plume rise calculations (e.g., Briggs equations). (Basic implementation added to `model.js`; further refinement, especially for stable conditions, is pending).
    -   [x] Define and apply boundary conditions (ground reflection, inversion layers if applicable). (Ground reflection included in Gaussian formula; inversion layers are a future consideration).
    -   [x] Use a grayscale gradient or color map for smoke concentration visualization. (Grayscale implemented).
-   [x] **Cloud Rendering:** Basic cloud rendering using bezier curves, arcs, ellipse.
-   [ ] **Controller Implementation:**
    -   [ ] Enable adding new stacks to the simulation.
    -   [ ] Implement controls for changing all environment and stack parameters. (Architectural support in controller exists; UI elements are pending - aligns with Phase 2).

### Phase 2: UI/UX Enhancements & Parameter Validation
-   [ ] **User-Friendly Controls:** Implement intuitive HTML controls (sliders, dropdowns, input fields) for all parameters with clear labels and units.
-   [ ] **Real-time Feedback:** Ensure immediate visual updates upon parameter changes.
-   [ ] **Input Validation:** Add validation for all user inputs to ensure they are within realistic and operational ranges.

### Phase 3: Model Refinement & Advanced Features
-   [ ] **Dispersion Coefficients:** Implement accurate selection and calculation of dispersion coefficients (e.g., Pasquill-Gifford `σy`, `σz`) based on stability class and downwind distance.
-   [ ] **Multiple Pollutant Sources:** Ensure the model correctly handles and visualizes overlapping plumes from multiple stacks.
-   [ ] (Optional) **Time Evolution:** Explore adding a time component for dynamic simulations.
-   [ ] (Optional) **Enhanced Visuals:** Improve the realism and detail of ground, sky, and plume graphics.

### Phase 4: Documentation & Testing
-   [ ] **Code Comments:** Add comprehensive comments for complex logic in the Model and View.
-   [ ] **`README.md` Update:** Finalize project description, setup, usage, and parameter explanations.
-   [ ] **Testing:**
    -   [ ] Conduct thorough manual testing with diverse parameter sets.
    -   [ ] (Optional) Implement unit tests for critical calculation functions in `model.js`.

## Skills Utilized
- HTML Canvas API
- CSS for styling
- JavaScript (Object-Oriented Programming)
- Gaussian dispersion principles

## Resources & Inspirations
- [Resize canvas using js](https://stackoverflow.com/questions/9251480/set-canvas-size-using-javascript/9251497)
- [JS OOP](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Object-oriented_JS)
- [Color Picker (for UI ideas)](https://www.w3schools.com/colors/colors_picker.asp)
- [Ellipse in HTML5 canvas](https://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas)
- [Dispersion coefficient reference](http://courses.washington.edu/cee490/DISPCOEF4WP.htm)

## Getting Started
*(Instructions on how to set up and run the project will be added here.)*

User gets initial screen containing a stack, emitting smoke, and time averaged plume line

User can change the parameters

### Stack Parameters
- posx, 
- posy, 
- height, 
- diameter of opening, 
- discharge
- limits of discharge (very severe, severe, moderately, good, excellent)
- background concentration

### Environment parameters
- Cloud cover, 
- wind speed, 
- temperature, 
- day/night, 
- stability class

### Ground
### Sky
### Cloud
### Smoke

## Skills required
- HTML canvas
- CSS styling
- JS OOP
- Gaussian distribution function

## Experience
- [Resize canvas using js](https://stackoverflow.com/questions/9251480/set-canvas-size-using-javascript/9251497)
- [JS OOP](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Object-oriented_JS)
- [Color Picker](https://www.w3schools.com/colors/colors_picker.asp)
- [Ellipse in HTML5 canvas](https://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas)
- [Dispersion coefficient](http://courses.washington.edu/cee490/DISPCOEF4WP.htm)

## Architecture
- model.js will maintain all the objects and its state
- controller.js will change the state of object, and call necessary view component
- script.js contains view layer, 

## Todo
- seggregate model, and controller from view
- [x] make engine for smoke
- render smoke
  - Give boundary condition
  - Use specific grayscale for increasing contrast in smoke concentration
  - Plume rise calculation
- [x] render cloud: bezier curves, arcs, ellipse
- Add controller
  - Add a new stack
  - Change environment parameters
