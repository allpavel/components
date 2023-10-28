import { useMemo } from "react";

export type Scope<T = any> = { [scopeName: string]: React.Context<T>[] } | undefined; // eslint-disable-line @typescript-eslint/no-explicit-any
type ScopeHook = (scope: Scope) => { [__scopeProp: string]: Scope };
export interface CreateScope {
  scopeName: string;
  (): ScopeHook;
}

export function composeContextsScopes(...scopes: CreateScope[]) {
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
      return useMemo(() => ({ [`__scope${baseScope.scopeName}`]: nextScopes }), [nextScopes]);
    };
  };
  createScope.scopeName = baseScope.scopeName;

  return createScope;
}
