import Component, { tracked } from "@glimmer/component";

const RENDERER_NAME = null; // This is just a placeholder; it is rewritten at build

export default class RenderVendor extends Component {
  @tracked data: any = {};
  private socket: WebSocket = null;

  didInsertElement() {
    this.socket = new WebSocket('ws://localhost:8080');

    this.socket.addEventListener('message', (event) => {
      let json = JSON.parse(event.data);

      if (json.renderer === RENDERER_NAME) {
        this.data = json.data;
      }
    });
  }

  willDestroy() {
    this.socket.close();
    this.socket = null;
  }
}
