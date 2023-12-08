export type GenericOnClickHandler<T extends HTMLElement> = (
  this: T,
  ev: MouseEvent & {
    currentTarget: T;
  },
) => void;
