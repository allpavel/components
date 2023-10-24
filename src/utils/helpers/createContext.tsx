import React from "react";

export type Scope<T = any> = { [scopeName: string]: React.Context<T>[] } | undefined; // eslint-disable-line @typescript-eslint/no-explicit-any
type ScopeHook = (scope: Scope) => { [__scopeProp: string]: Scope };
export interface CreateScope {
  scopeName: string;
  (): ScopeHook;
}

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

function composeContextsScopes(...scopes: CreateScope[]) {
  if (scopes.length === 1) {
    return scopes[0];
  }

  const baseScope = scopes[0];

  const createScope: CreateScope = () => {
    const scopeHooks = scopes.map((createScope) => ({ useScope: createScope(), scopeName: createScope.scopeName }));

    return function useComposedScopes(overrideScopes) {
      const nextScopes = scopeHooks.reduce((nextScopes, { useScope, scopeName }) => {
        const scopeProps = useScope(overrideScopes); // eslint-disable-line react-hooks/rules-of-hooks
        const currentScope = scopeProps[`__scope${scopeName}`];
        return { ...nextScopes, ...currentScope };
      }, {});
      return React.useMemo(() => ({ [`__scope${baseScope.scopeName}`]: nextScopes }), [nextScopes]);
    };
  };
  createScope.scopeName = baseScope.scopeName;

  return createScope;
}
