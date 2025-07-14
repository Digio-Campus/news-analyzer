// Tipos básicos para la PoC
export interface Comment {
  author: string;
  content: string;
  date: string; // ISO 8601 format
  likes: number;
  sentiment: 'positivo' | 'negativo' | 'neutral';
  emotion?: 'alegría' | 'enfado' | 'tristeza' | 'neutral';
}

export interface ParameterConfig {
  type: 'path' | 'query';
  description?: string;
  defaultValue?: any;
}

export interface EndpointConfiguration {
  method: string;
  urlTemplate: string;
  parameters: { [key: string]: ParameterConfig };
  headers: Record<string, string>;
  paginationFields: {
    commentsArrayPath: string;
    hasMorePagesField: string;
    hasMorePagesOperator?: 'truthy' | 'falsy' | '===' | '!==' | '>' | '<';
    hasMorePagesValue?: any;
    nextPageIncrement: number;
    pageParameterName: string;
  };
}
