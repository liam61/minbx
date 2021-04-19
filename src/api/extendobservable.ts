import { computedDecorator } from './computed';
import { observableDecorator } from './observable';
import { endBatch, startBatch } from '../core/globalstate';

export function extendObservable(target: any, properties: any) {
  startBatch();
  try {
    Object.keys(properties).forEach(key => {
      const descriptor = Object.getOwnPropertyDescriptor(properties, key);
      const decorator = descriptor!.get
        ? computedDecorator
        : observableDecorator;
      const resultDescriptor = decorator(target, key, descriptor);
      Object.defineProperty(target, key, resultDescriptor);
    });
    return target;
  } finally {
    endBatch();
  }
}
