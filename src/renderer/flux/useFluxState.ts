import { useEffect, useState } from "react";
import Store from "./Store";

export const useFluxState = <T>(store: Store<T>) => {
  const [state, setState] = useState(store.state);

  useEffect(() => {
    const unsubscribe = store.subscribe(setState);
    return unsubscribe();
  }, [store]);

  return state;
};
