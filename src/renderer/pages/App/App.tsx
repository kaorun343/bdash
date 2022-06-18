import React from "react";
import classNames from "classnames";
import GlobalMenu from "../../components/GlobalMenu";
import { store } from "./AppStore";
import Action from "./AppAction";
import Query from "../Query";
import DataSource from "../DataSource";
import Setting from "../Setting";
import { useFluxState } from "../../flux/useFluxState";

const App: React.FC = () => {
  const state = useFluxState(store);

  React.useEffect(() => {
    Action.initialize();
  }, []);

  const getSelectedPage = () => {
    switch (state.selectedPage) {
      case "query":
        return Query;
      case "dataSource":
        return DataSource;
      case "setting":
        return Setting;
      default:
        throw new Error(`Unknown page: ${state.selectedPage}`);
    }
  };

  const render = () => {
    const Page = getSelectedPage();

    return (
      <div className="page-app">
        <div className={classNames("page-app-menu", { darwin: process.platform === "darwin" })}>
          <GlobalMenu selectedPage={state.selectedPage} onSelect={Action.selectPage} />
        </div>
        <div className="page-app-main">
          <Page />
        </div>
      </div>
    );
  };

  return render();
};

export default App;
