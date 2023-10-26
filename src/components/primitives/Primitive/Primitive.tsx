import { ComponentPropsWithRef, ElementType, ForwardRefExoticComponent, forwardRef } from "react";
import { Slot } from "../Slot/Slot";

const NODES = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "span",
  "svg",
  "ul",
] as const;

type PrimitivePropsWithRef<E extends ElementType> = ComponentPropsWithRef<E> & { asChild?: boolean };

interface PrimitiveForwardRefComponent<E extends ElementType>
  extends ForwardRefExoticComponent<PrimitivePropsWithRef<E>> {}

type Primitives = { [E in (typeof NODES)[number]]: PrimitiveForwardRefComponent<E> };

export const Primitive = NODES.reduce((primitive, node) => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const Node = forwardRef(({ asChild, ...props }: PrimitivePropsWithRef<typeof node>, ref: any) => {
    const Component: any = asChild ? Slot : node;

    return <Component {...props} ref={ref} />;
  });
  Node.displayName = `Primitive.${node}`;

  return { ...primitive, [node]: Node };
  /* eslint-enable*/
}, {} as Primitives);

export const Root = Primitive;
