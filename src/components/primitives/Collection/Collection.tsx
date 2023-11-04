import { ComponentPropsWithoutRef, FC, ReactNode, RefObject, forwardRef, useCallback, useEffect, useRef } from "react";
import { Slot } from "../Slot/Slot";
import { createContextScope } from "@/utils/context/createContextScope";
import { useComposedRefs } from "@/utils/helpers/composeRefs";

type SlotsProps = ComponentPropsWithoutRef<typeof Slot>;
type CollectionElement = HTMLElement;
export interface CollectionProps extends SlotsProps {
  scope: any; // eslint-disable-line
}

// eslint-disable-next-line
export function createCollection<ItemElement extends HTMLElement, ItemData = {}>(name: string) {
  const providerName = `${name}CollectionProvider`;
  const slotName = `${name}CollectionSlot`;
  const dataAttribute = "collection-item";

  type ContextValue = {
    collectionRef: RefObject<CollectionElement>;
    itemMap: Map<RefObject<ItemElement>, { ref: RefObject<ItemElement> } & ItemData>;
  };

  type CollectionItemSlotProps = ItemData & {
    children: ReactNode;
    scope: any; //eslint-disable-line
  };

  const [createCollectionContext, createCollectionScope] = createContextScope(providerName);

  const [CollectionProviderImpl, useCollectionContext] = createCollectionContext<ContextValue>(providerName, {
    collectionRef: { current: null },
    itemMap: new Map(),
  });

  // eslint-disable-next-line
  const CollectionProvider: FC<{ children?: ReactNode; scope: any }> = ({ scope, children }) => {
    const ref = useRef<CollectionElement>(null);
    const itemMap = useRef<ContextValue["itemMap"]>(new Map()).current;
    return (
      <CollectionProviderImpl scope={scope} itemMap={itemMap} collectionRef={ref}>
        {children}
      </CollectionProviderImpl>
    );
  };
  CollectionProvider.displayName = providerName;

  const CollectionSlot = forwardRef<CollectionElement, CollectionProps>(({ scope, children }, ref) => {
    const context = useCollectionContext(slotName, scope);
    const composedRefs = useComposedRefs(ref, context.collectionRef);
    return <Slot ref={composedRefs}>{children}</Slot>;
  });
  CollectionSlot.displayName = slotName;

  const CollectionItemSlot = forwardRef<ItemElement, CollectionItemSlotProps>(
    ({ scope, children, ...data }, forwardedRef) => {
      const ref = useRef<ItemElement>(null);
      const composedRefs = useComposedRefs(forwardedRef, ref);
      const context = useCollectionContext(slotName, scope);

      useEffect(() => {
        context.itemMap.set(ref, { ref, ...(data as unknown as ItemData) });
        return () => void context.itemMap.delete(ref);
      });

      return (
        <Slot {...{ [dataAttribute]: "" }} ref={composedRefs}>
          {children}
        </Slot>
      );
    },
  );
  CollectionItemSlot.displayName = slotName;

  //eslint-disable-next-line
  function useCollection(scope: any) {
    const context = useCollectionContext(`${name}CollectionConsumer`, scope);

    const getItems = useCallback(() => {
      const collectionNode = context.collectionRef.current;
      if (!collectionNode) {
        return [];
      }

      const orderedNodes = Array.from(collectionNode.querySelectorAll(`[${dataAttribute}]`));
      const items = Array.from(context.itemMap.values());
      const orderedItems = items.sort(
        (a, b) => orderedNodes.indexOf(a.ref.current!) - orderedNodes.indexOf(b.ref.current!),
      );
      return orderedItems;
    }, [context.collectionRef, context.itemMap]);

    return getItems;
  }

  return [
    { Provider: CollectionProvider, Slot: CollectionSlot, ItemSlot: CollectionItemSlot },
    useCollection,
    createCollectionScope,
  ] as const;
}
