import React from "react";
import { composeContextsScopes } from "../helpers/composeContextsScopes";

export type Scope<T = any> = { [scopeName: string]: React.Context<T>[] } | undefined; // eslint-disable-line @typescript-eslint/no-explicit-any
type ScopeHook = (scope: Scope) => { [__scopeProp: string]: Scope };
export interface CreateScope {
  scopeName: string;
  (): ScopeHook;
}

export function createContextScope(scopeName: string, createContextScopeDeps: CreateScope[] = []) {
  let defaultContexts: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any

  function createContext<ContextValueType extends object | null>(
    rootComponentName: string,
    defaultContext?: ContextValueType,
  ) {
    const BaseContext = React.createContext<ContextValueType | undefined>(defaultContext);
    const index = defaultContexts.length;
    defaultContexts = [...defaultContexts, defaultContext];

    function Provider({
      scope,
      children,
      ...context
    }: ContextValueType & {
      children: React.ReactNode;
      scope: Scope<ContextValueType>;
    }) {
      const Context = scope?.[scopeName][index] || BaseContext;

      const value = React.useMemo(
        () => context,
        Object.values(context), // eslint-disable-line react-hooks/exhaustive-deps
      ) as ContextValueType;
      return <Context.Provider value={value}>{children}</Context.Provider>;
    }

    function useContext(consumerName: string, scope: Scope<ContextValueType | undefined>) {
      const Context = scope?.[scopeName][index] || BaseContext;
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

  const createScope: CreateScope = () => {
    const scopeContexts = defaultContexts.map((defaultContext) => React.createContext(defaultContext));
    return function useScope(scope: Scope) {
      const contexts = scope?.[scopeName] || scopeContexts;
      return React.useMemo(() => ({ [`__scope${scopeName}`]: { ...scope, [scopeName]: contexts } }), [scope, contexts]);
    };
  };
  createScope.scopeName = scopeName;

  return [createContext, composeContextsScopes(createScope, ...createContextScopeDeps)] as const;
}
