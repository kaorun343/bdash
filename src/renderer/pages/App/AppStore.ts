import Store, { StateBuilder } from "../../flux/Store";

export interface AppState {
  selectedPage: string;
}

export default class AppStore extends Store<AppState> {
  constructor() {
    super();
    this.state = {
      selectedPage: "query",
    };
  }

  override reduce(type: string, payload: any): StateBuilder<AppState> {
    switch (type) {
      case "selectPage": {
        return this.set("selectedPage", payload.page);
      }
      default: {
        throw new Error("Invalid type");
      }
    }
  }
}

const { store, dispatch } = Store.create<AppState>(AppStore);
export { store, dispatch };
