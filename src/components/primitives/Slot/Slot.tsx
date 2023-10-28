import { Children, HTMLAttributes, ReactElement, ReactNode, cloneElement, forwardRef, isValidElement } from "react";
import { composeProps } from "@/utils/helpers/composeProps";
import { composeRef } from "@/utils/helpers/composeRefs";

export interface SlotProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

interface SlotCloneProps {
  children: ReactNode;
}

export const Slottable = ({ children }: { children: ReactNode }) => <>{children}</>;

function isSlottable(child: ReactNode): child is ReactElement {
  return isValidElement(child) && child.type === Slottable;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const SlotClone = forwardRef<any, SlotCloneProps>(({ children, ...props }, forwardedRef) => {
  if (isValidElement(children)) {
    return cloneElement<any>(children, {
      ...composeProps(props, children.props),

      ref: forwardedRef ? composeRef(forwardedRef, (children as any).ref) : (children as any).ref,
    });
  }
  return Children.count(children) > 1 ? Children.only(null) : null;
});
/* eslint-enable*/
SlotClone.displayName = "SlotClone";

export const Slot = forwardRef<HTMLElement, SlotProps>(({ children, ...props }, ref) => {
  const childrenArray = Children.toArray(children);
  const slottable = childrenArray.find(isSlottable);

  if (slottable) {
    const newElement = slottable.props.children as ReactNode;

    const newChildren = childrenArray.map((child) => {
      if (child === slottable) {
        if (Children.count(newElement) > 1) {
          return Children.only(null);
        }
        return isValidElement(newElement) ? (newElement.props.children as ReactNode) : null;
      } else {
        return child;
      }
    });
    return (
      <SlotClone {...props} ref={ref}>
        {isValidElement(newElement) ? cloneElement(newElement, undefined, newChildren) : null}
      </SlotClone>
    );
  }
  return (
    <SlotClone {...props} ref={ref}>
      {children}
    </SlotClone>
  );
});
Slot.displayName = "Slot";

export const Root = Slot;
