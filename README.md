# Model of the air pollution using gaussian distribution function

## Workflow

User gets initial screen containing a stack, emitting smoke, and time averaged plume line
User can change the parameters
### Stack Parameters
posx, posy, height, diameter of opening
### Ground
### Sky
### Cloud
### Smoke

### Environment parameters

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

## Todo
- model.js will maintain all the objects and its state
- controller.js will change the state of object, and call necessary view component
- script.js contains view layer, need to seggregate model all state from view.
- make engine for smoke
- render smoke
- render cloud: bezier curves, arcs, ellipse
