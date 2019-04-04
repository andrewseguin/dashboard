import {Observable} from 'rxjs';

export interface DataSourceMetadata<T> {
  id: string;
  label: string;
  type: string;
  accessor: (item: T) => any;
}

export class DataSource<T = any> {
  constructor(public metadata: Map<string, DataSourceMetadata<T>>, private data: Observable<T[]>) {}

  /** Gets a stream that provides the list of items. */
  getData(): Observable<T[]> {
    return this.data;
  }

  getMetadataListForType(type: string): DataSourceMetadata<T>[] {
    const metadataListForType: DataSourceMetadata<T>[] = [];
    this.metadata.forEach(metadata => {
      if (metadata.type === type) {
        metadataListForType.push(metadata);
      }
    });
    return metadataListForType;
  }

  getMetadataMapForType(type: string): Map<string, DataSourceMetadata<T>> {
    const metadataMapForType = new Map<string, DataSourceMetadata<T>>();
    this.getMetadataListForType(type).forEach(metadata => {
      metadataMapForType.set(metadata.id, metadata);
    });
    return metadataMapForType;
  }
}
