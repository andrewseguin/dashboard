import {Observable} from 'rxjs';

export interface ProviderMetadata<T> {
  id: string;
  label: string;
  type: string;
  accessor: (item: T) => any;
}

export class Provider<T = any> {
  constructor(public metadata: Map<string, ProviderMetadata<T>>, private data: Observable<T[]>) {}

  /** Gets a stream that provides the list of items. */
  getData(): Observable<T[]> {
    return this.data;
  }

  getMetadataListForType(type: string): ProviderMetadata<T>[] {
    const metadataListForType: ProviderMetadata<T>[] = [];
    this.metadata.forEach(metadata => {
      if (metadata.type === type) {
        metadataListForType.push(metadata);
      }
    });
    return metadataListForType;
  }

  getMetadataMapForType(type: string): Map<string, ProviderMetadata<T>> {
    const metadataMapForType = new Map<string, ProviderMetadata<T>>();
    this.getMetadataListForType(type).forEach(metadata => {
      metadataMapForType.set(metadata.id, metadata);
    });
    return metadataMapForType;
  }
}
