import React from "react";

export function createContext<ContextValueType extends object | null>(
  rootComponentName: string,
  defaultContext?: ContextValueType,
) {
  const Context = React.createContext<ContextValueType | undefined>(defaultContext);

  function Provider({ children, ...context }: ContextValueType & { children: React.ReactNode }) {
    const value = React.useMemo(
      () => context,
      Object.values(context), // eslint-disable-line
    ) as ContextValueType;
    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useContext(consumerName: string) {
    const context = React.useContext(Context);
    if (context) {
      return context;
    }
    if (defaultContext !== undefined) {
      return defaultContext;
    }
    throw new Error(`${consumerName} must be used within ${rootComponentName}`);
  }

  Provider.displayName = `${rootComponentName}Provider`;

  return [Provider, useContext] as const;
}
