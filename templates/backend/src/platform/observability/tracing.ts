import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

export function startTracing(endpoint?: string): NodeSDK | undefined {
  if (!endpoint) return undefined;
  const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({ url: endpoint }),
    metricReaders: [],
    logRecordProcessors: [],
  });
  sdk.start();
  return sdk;
}
