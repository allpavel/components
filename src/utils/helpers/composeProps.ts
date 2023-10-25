type Props = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export function composeProps(slotProps: Props, childProps: Props) {
  const overrideProps = { ...childProps };
  for (const prop in childProps) {
    const slotPropValue = slotProps[prop];
    const childPropValue = childProps[prop];

    const isHandler = /^on[A-Z]/.test(prop);

    if (isHandler) {
      if (slotPropValue && childPropValue) {
        overrideProps[prop] = (...args: unknown[]) => {
          slotPropValue(...args);
          childPropValue(...args);
        };
      } else if (slotPropValue) {
        overrideProps[prop] = slotPropValue;
      }
    } else if (prop === "style") {
      overrideProps[prop] = { ...slotPropValue, ...childPropValue };
    } else if (prop === "className") {
      overrideProps[prop] = [slotPropValue, childPropValue].filter(Boolean).join(" ");
    }
  }

  return { ...slotProps, overrideProps };
}
