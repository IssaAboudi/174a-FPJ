import { defs, tiny } from "./examples/common.js";

// Modified tiny-graphics-widgets.js common.js
// to clean up game webpage (disabled code block widget, file structure widget,
// and basic movement controls set by default - we will create our own movement controls
// called "Game_Controls")

const {
  Vector,
  Vector3,
  vec,
  vec3,
  vec4,
  color,
  hex_color,
  Shader,
  Matrix,
  Mat4,
  Light,
  Shape,
  Material,
  Scene,
} = tiny;

class Cube extends Shape {
  constructor() {
    super("position", "normal");
    // Loop 3 times (for each axis), and inside loop twice (for opposing cube sides):
    this.arrays.position = Vector3.cast(
      [-1, -1, -1],
      [1, -1, -1],
      [-1, -1, 1],
      [1, -1, 1],
      [1, 1, -1],
      [-1, 1, -1],
      [1, 1, 1],
      [-1, 1, 1],
      [-1, -1, -1],
      [-1, -1, 1],
      [-1, 1, -1],
      [-1, 1, 1],
      [1, -1, 1],
      [1, -1, -1],
      [1, 1, 1],
      [1, 1, -1],
      [-1, -1, 1],
      [1, -1, 1],
      [-1, 1, 1],
      [1, 1, 1],
      [1, -1, -1],
      [-1, -1, -1],
      [1, 1, -1],
      [-1, 1, -1]
    );
    this.arrays.normal = Vector3.cast(
      [0, -1, 0],
      [0, -1, 0],
      [0, -1, 0],
      [0, -1, 0],
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
      [-1, 0, 0],
      [-1, 0, 0],
      [-1, 0, 0],
      [-1, 0, 0],
      [1, 0, 0],
      [1, 0, 0],
      [1, 0, 0],
      [1, 0, 0],
      [0, 0, 1],
      [0, 0, 1],
      [0, 0, 1],
      [0, 0, 1],
      [0, 0, -1],
      [0, 0, -1],
      [0, 0, -1],
      [0, 0, -1]
    );
    // Arrange the vertices into a square shape in texture space too:
    this.indices.push(
      0,
      1,
      2,
      1,
      3,
      2,
      4,
      5,
      6,
      5,
      7,
      6,
      8,
      9,
      10,
      9,
      11,
      10,
      12,
      13,
      14,
      13,
      15,
      14,
      16,
      17,
      18,
      17,
      19,
      18,
      20,
      21,
      22,
      21,
      23,
      22
    );
  }
}

// // Example B: Define lines
class Axis extends Shape {
  constructor() {
    super("position", "color");
    this.arrays.position = Vector3.cast(
      [0, 0, 0],
      [1000, 0, 0],
      [0, 0, 0],
      [0, 1000, 0],
      [0, 0, 0],
      [0, 0, 1000]
    );
    this.arrays.color = [
      vec4(1, 0, 0, 1),
      vec4(1, 0, 0, 1),
      vec4(0, 1, 0, 1),
      vec4(0, 1, 0, 1),
      vec4(0, 0, 1, 1),
      vec4(0, 0, 1, 1),
    ];
    this.indices = false; // not necessary
  }
}

const Game_Controls = (defs.Game_Controls = class Game_Controls extends Scene {
  constructor() {
    super();
    const data_members = {
      thrust: new Vector(0, 0),
      pos: vec3(0, 0, 0),
      z_axis: vec3(0, 0, 0),
      radians_per_frame: 1 / 200,
      meters_per_frame: 10,
      speed_multiplier: 1,
    };
    Object.assign(this, data_members);

    this.mouse_enabled_canvases = new Set();
    this.will_take_over_graphics_state = true;
  }

  set_recipient(matrix_closure, inverse_closure) {
    // set_recipient(): The camera matrix is not actually stored here inside Movement_Controls;
    // instead, track an external target matrix to modify.  Targets must be pointer references
    // made using closures.
    this.matrix = matrix_closure;
    this.inverse = inverse_closure;
  }

  reset(graphics_state) {
    // reset(): Initially, the default target is the camera matrix that Shaders use, stored in the
    // encountered program_state object.  Targets must be pointer references made using closures.
    this.set_recipient(
      () => graphics_state.camera_transform,
      () => graphics_state.camera_inverse
    );
  }

  make_control_panel() {
    //Make all the buttons for in the control panel here:

    // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
    this.key_triggered_button(
      "Sample Button",
      ["A"],
      () => (this.attached = () => null)
    );
    this.new_line();
  }

  display(
    context,
    graphics_state,
    dt = graphics_state.animation_delta_time / 1000
  ) {
    // The whole process of acting upon controls begins here.
    const m = this.speed_multiplier * this.meters_per_frame,
      r = this.speed_multiplier * this.radians_per_frame;

    if (this.will_take_over_graphics_state) {
      this.reset(graphics_state);
      this.will_take_over_graphics_state = false;
    }
  }
});

export class BrickBreaker extends Scene {
  constructor() {
    // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
    super();

    this.shapes = {
      sphere: new defs.Subdivision_Sphere(4),
      circle: new defs.Regular_2D_Polygon(1, 15),
      bricks: new Cube(),
      axis: new Axis(),
    };

    this.materials = {
      default: new Material(new defs.Phong_Shader(), {
        ambient: 0.4,
        diffusivity: 0.6,
        color: hex_color("#ffffff"),
      }),
      plastic: new Material(new defs.Phong_Shader(), {
        ambient: 1,
        diffusivity: 1,
        specularity: 1,
        color: hex_color("#b08040"),
      }),
    };

    this.white = new Material(new defs.Basic_Shader());

    this.initial_camera_location = Mat4.look_at(
      vec3(0, 10, 20),
      vec3(0, 0, 0),
      vec3(0, 1, 0)
    );

    this.colors = [];
    this.set_colors();
  }

  set_colors() {
    // TODO:  Create a class member variable to store your cube's colors.
    // Hint:  You might need to create a member variable at somewhere to store the colors, using `this`.
    // Hint2: You can consider add a constructor for class Assignment2, or add member variables in Base_Scene's constructor.
    this.colors = [];
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        this.colors.push(color(Math.random(), Math.random(), Math.random(), 1));
      }
    }
  }

  make_control_panel() {
    this.control_panel.innerHTML += " Description of Game goes here.<br>";
  }

  display(context, program_state) {
    // display():  Called once per frame of animation.
    // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
    if (!context.scratchpad.controls) {
      this.children.push(
        (context.scratchpad.controls = new defs.Movement_Controls())
      );
      // Define the global camera and projection matrices, which are stored in program_state.
      program_state.set_camera(this.initial_camera_location);
    }

    program_state.projection_transform = Mat4.perspective(
      Math.PI / 4,
      context.width / context.height,
      0.1,
      1000
    );

    let axis_model_transform = Mat4.identity();
    this.shapes.axis.draw(
      context,
      program_state,
      axis_model_transform,
      this.white,
      "LINES"
    );

    const ts = program_state.animation_time / 1000; //time step (for each second of animation)
    const dt = program_state.animation_delta_time / 1000; //time difference between current and last frame (keep game frame independent)

    //add code here
    program_state.lights = [
      new Light(vec4(0, 0, 20, 1), color(1, 1, 1, 1), 10 ** 10),
    ]; //Default Light

    let brick_transform = Mat4.translation(0, 20, 0);
    brick_transform = Mat4.translation(3, 0, 0).times(
      Mat4.scale(3, 1, 1).times(brick_transform)
    );

    // Draw Cube Grid 10x 10 (use function to set size this is temp)
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        this.shapes.bricks.draw(
          context,
          program_state,
          Mat4.translation(6.4 * j, 2.4 * i, 0).times(brick_transform),
          this.materials.plastic.override({ color: this.colors[i + i * j] })
        );
      }
    }

    // Draw plate (centered it, but use variables to keep it always centered
    // depending on grid pramaeters) (use a deformed sphere so that the ball goes
    // off at different angles)
    let plate_transform = Mat4.identity();
    plate_transform = Mat4.translation(1 * 6.2 + 4 * 6.4, 0, 0).times(
      Mat4.scale(6.2, 2, 1).times(plate_transform)
    );

    this.shapes.sphere.draw(
      context,
      program_state,
      plate_transform,
      this.materials.plastic
    );

    // Draw ball
    let ball_transform = Mat4.identity();
    ball_transform = Mat4.translation(1 * 6.2 + 4 * 6.4, 1 + 2, 0).times(
      ball_transform
    );

    this.shapes.sphere.draw(
      context,
      program_state,
      ball_transform,
      this.materials.default
    );
  }
}

class Gouraud_Shader extends Shader {
  // This is a Shader using Phong_Shader as template

  constructor(num_lights = 2) {
    super();
    this.num_lights = num_lights;
  }

  send_material(gl, gpu, material) {
    // send_material(): Send the desired shape-wide material qualities to the
    // graphics card, where they will tweak the Phong lighting formula.
    gl.uniform4fv(gpu.shape_color, material.color);
    gl.uniform1f(gpu.ambient, material.ambient);
    gl.uniform1f(gpu.diffusivity, material.diffusivity);
    gl.uniform1f(gpu.specularity, material.specularity);
    gl.uniform1f(gpu.smoothness, material.smoothness);
  }

  send_gpu_state(gl, gpu, gpu_state, model_transform) {
    // send_gpu_state():  Send the state of our whole drawing context to the GPU.
    const O = vec4(0, 0, 0, 1),
      camera_center = gpu_state.camera_transform.times(O).to3();
    gl.uniform3fv(gpu.camera_center, camera_center);
    // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
    const squared_scale = model_transform
      .reduce((acc, r) => {
        return acc.plus(vec4(...r).times_pairwise(r));
      }, vec4(0, 0, 0, 0))
      .to3();
    gl.uniform3fv(gpu.squared_scale, squared_scale);
    // Send the current matrices to the shader.  Go ahead and pre-compute
    // the products we'll need of the of the three special matrices and just
    // cache and send those.  They will be the same throughout this draw
    // call, and thus across each instance of the vertex shader.
    // Transpose them since the GPU expects matrices as column-major arrays.
    const PCM = gpu_state.projection_transform
      .times(gpu_state.camera_inverse)
      .times(model_transform);
    gl.uniformMatrix4fv(
      gpu.model_transform,
      false,
      Matrix.flatten_2D_to_1D(model_transform.transposed())
    );
    gl.uniformMatrix4fv(
      gpu.projection_camera_model_transform,
      false,
      Matrix.flatten_2D_to_1D(PCM.transposed())
    );

    // Omitting lights will show only the material color, scaled by the ambient term:
    if (!gpu_state.lights.length) return;

    const light_positions_flattened = [],
      light_colors_flattened = [];
    for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
      light_positions_flattened.push(
        gpu_state.lights[Math.floor(i / 4)].position[i % 4]
      );
      light_colors_flattened.push(
        gpu_state.lights[Math.floor(i / 4)].color[i % 4]
      );
    }
    gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
    gl.uniform4fv(gpu.light_colors, light_colors_flattened);
    gl.uniform1fv(
      gpu.light_attenuation_factors,
      gpu_state.lights.map((l) => l.attenuation)
    );
  }

  update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
    // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader
    // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
    // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or
    // program (which we call the "Program_State").  Send both a material and a program state to the shaders
    // within this function, one data field at a time, to fully initialize the shader for a draw.

    // Fill in any missing fields in the Material object with custom defaults for this shader:
    const defaults = {
      color: color(0, 0, 0, 1),
      ambient: 0,
      diffusivity: 1,
      specularity: 1,
      smoothness: 40,
    };
    material = Object.assign({}, defaults, material);

    this.send_material(context, gpu_addresses, material);
    this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
  }
}
