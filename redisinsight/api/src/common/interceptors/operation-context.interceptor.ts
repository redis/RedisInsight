import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { operationContext } from 'src/common/context/operation.context';

/**
 * Maps `<Controller>.<handler>` to a short human readable label shown in the
 * command log panel. Handlers missing from this map fall back to the raw
 * handler name, which is still meaningful and never breaks the request — add
 * entries here only when the handler name is not self-explanatory.
 */
const OPERATION_LABELS: Record<string, string> = {
  // Connection
  'DatabaseController.create': 'Create connection',
  'DatabaseController.update': 'Update connection',
  'DatabaseController.clone': 'Clone connection',
  'DatabaseController.testConnection': 'Test connection',
  'DatabaseController.testExistConnection': 'Test connection',
  'DatabaseInfoController.getInfo': 'Load database info',
  'DatabaseInfoController.getDatabaseOverview': 'Load database overview',
  'DatabaseInfoController.getDangerousCommands': 'Load dangerous commands',
  'DatabaseInfoController.getDatabaseIndex': 'Switch logical database',
  // Keys
  'KeysController.getKeys': 'Load key list',
  'KeysController.getKeysInfo': 'Load key details',
  'KeysController.getKeyInfo': 'Load key value',
  'KeysController.deleteKey': 'Delete key',
  'KeysController.renameKey': 'Rename key',
  'KeysController.updateTtl': 'Update key TTL',
  // String
  'StringController.getStringValue': 'Load string value',
  'StringController.setString': 'Add string key',
  'StringController.updateStringValue': 'Save string value',
  // Hash
  'HashController.getMembers': 'Load hash fields',
  'HashController.createHash': 'Add hash key',
  'HashController.addMember': 'Add hash field',
  'HashController.deleteFields': 'Delete hash fields',
  'HashController.updateTtl': 'Update hash TTL',
  // List
  'ListController.getElements': 'Load list elements',
  'ListController.createList': 'Add list key',
  'ListController.pushElement': 'Push list element',
  'ListController.updateElement': 'Save list element',
  'ListController.deleteElement': 'Delete list element',
  // Set
  'SetController.getMembers': 'Load set members',
  'SetController.createSet': 'Add set key',
  'SetController.addMembers': 'Add set members',
  'SetController.deleteMembers': 'Delete set members',
  // Sorted set
  'ZSetController.getZSet': 'Load sorted set',
  'ZSetController.createSet': 'Add sorted set key',
  'ZSetController.addMembers': 'Add sorted set members',
  'ZSetController.updateMember': 'Save sorted set member',
  'ZSetController.deleteMembers': 'Delete sorted set members',
  'ZSetController.searchZSet': 'Search sorted set',
  // Stream
  'StreamController.getEntries': 'Load stream entries',
  'StreamController.createStream': 'Add stream key',
  'StreamController.addEntries': 'Add stream entries',
  'StreamController.deleteEntries': 'Delete stream entries',
  'ConsumerGroupController.getGroups': 'Load consumer groups',
  'ConsumerGroupController.createGroups': 'Create consumer group',
  'ConsumerGroupController.updateGroup': 'Save consumer group',
  'ConsumerGroupController.deleteGroup': 'Delete consumer group',
  'ConsumerController.getConsumers': 'Load consumers',
  'ConsumerController.deleteConsumers': 'Delete consumers',
  'ConsumerController.getPendingEntries': 'Load pending entries',
  'ConsumerController.ackPendingEntries': 'Acknowledge pending entries',
  'ConsumerController.claimPendingEntries': 'Claim pending entries',
  // JSON
  'RejsonRlController.getJson': 'Load JSON value',
  'RejsonRlController.createJson': 'Add JSON key',
  'RejsonRlController.jsonSet': 'Save JSON value',
  'RejsonRlController.arrAppend': 'Append to JSON array',
  'RejsonRlController.remove': 'Delete JSON path',
  // Vector set
  'VectorSetController.getElements': 'Load vector set',
  'VectorSetController.createVectorSet': 'Add vector set key',
  'VectorSetController.addElements': 'Add vector set elements',
  'VectorSetController.similaritySearch': 'Search similar vectors',
  // Array
  'ArrayController.getRange': 'Load array range',
  'ArrayController.createArray': 'Add array key',
  'ArrayController.setElement': 'Save array element',
  'ArrayController.appendElement': 'Append array element',
  'ArrayController.scan': 'Scan array',
  // Search
  'RedisearchController.list': 'Load indexes',
  'RedisearchController.createIndex': 'Create index',
  'RedisearchController.search': 'Search index',
  'RedisearchController.info': 'Load index info',
  'RedisearchController.delete': 'Delete index',
  // History
  'BrowserHistoryController.list': 'Load command history',
  'BrowserHistoryController.delete': 'Delete history entry',
  'BrowserHistoryController.bulkDelete': 'Clear command history',
  // Keys — remaining
  'ListController.getElement': 'Load list element',
  'RedisearchController.getKeyIndexes': 'Load key indexes',
  'RejsonRlController.downloadJsonFile': 'Download JSON value',
  'StringController.downloadStringFile': 'Download string value',
  // Vector set — remaining
  'VectorSetController.getElementDetails': 'Load vector details',
  'VectorSetController.setElementAttribute': 'Save vector attributes',
  'VectorSetController.downloadEmbedding': 'Download vector embedding',
  'VectorSetController.deleteElements': 'Delete vector set elements',
  'VectorSetController.getSimilaritySearchPreview': 'Preview similarity search',
  // Array — remaining
  'ArrayController.getElement': 'Load array element',
  'ArrayController.getLength': 'Load array length',
  'ArrayController.getCount': 'Count array elements',
  'ArrayController.getNextIndex': 'Load next array index',
  'ArrayController.getMultiElements': 'Load array elements',
  'ArrayController.search': 'Search array',
  'ArrayController.aggregate': 'Aggregate array',
  'ArrayController.deleteElements': 'Delete array elements',
  'ArrayController.deleteRange': 'Delete array range',
  // Connections — remaining
  'DatabaseController.list': 'Load connections',
  'DatabaseController.get': 'Load connection',
  'DatabaseController.connect': 'Open connection',
  'DatabaseController.deleteDatabaseInstance': 'Delete connection',
  'DatabaseController.bulkDeleteDatabaseInstance': 'Delete connections',
  'DatabaseController.exportConnections': 'Export connections',
  'DatabaseImportController.import': 'Import connections',
  // Database analysis & recommendations
  'DatabaseAnalysisController.list': 'Load analyses',
  'DatabaseAnalysisController.get': 'Load analysis',
  'DatabaseAnalysisController.create': 'Create analysis',
  'DatabaseAnalysisController.modify': 'Update analysis',
  'DatabaseRecommendationController.list': 'Load recommendations',
  'DatabaseRecommendationController.read': 'Load recommendation',
  'DatabaseRecommendationController.modify': 'Update recommendation',
  'DatabaseRecommendationController.bulkDeleteDatabaseRecommendation':
    'Delete recommendations',
};

/**
 * Binds the name of the operation being executed to the async context of the
 * request so the Redis client layer can label every command it records.
 *
 * Without this interceptor the command log panel would still work but every
 * entry would be unattributed, which is far less useful when learning which
 * command a given UI action produces.
 */
@Injectable()
export class OperationContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Only HTTP requests carry an operation context. WebSocket handlers are
    // driven by their own lifecycle and must not be wrapped here.
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const operation = OperationContextInterceptor.resolveOperation(context);

    // `next.handle()` returns a cold Observable: the route handler only runs
    // once it is subscribed to. Subscribing inside `run()` keeps the store
    // visible to the handler and to everything it awaits.
    return new Observable((subscriber) =>
      operationContext.run({ operation }, () =>
        next.handle().subscribe(subscriber),
      ),
    );
  }

  static resolveOperation(context: ExecutionContext): string {
    try {
      const handlerName = context.getHandler()?.name;
      const controllerName = context.getClass()?.name;

      return (
        OPERATION_LABELS[`${controllerName}.${handlerName}`] ||
        handlerName ||
        'Unknown operation'
      );
    } catch (e) {
      return 'Unknown operation';
    }
  }
}
