import express from "express";
import { config } from "./config";
import {
  eventsRepository,
  sourcesRepository,
  getAlertConfig,
  upsertAlertConfig,
} from "./repositories";
import { makeEventsRouter } from "./routes/events";
import { makeSourcesRouter } from "./routes/sources";
import { makeAlertRouter } from "./routes/alert";
import { makeStatsRouter } from "./routes/stats";
import { makeEmailNotifier } from "./services/email";
import { makeHealthRouter } from "./routes/health";

const app = express();
app.use(express.json());
app.use("/health", makeHealthRouter());

app.get("/", (_req, res) => res.send("OK"));

const alertRepo = { getAlertConfig, upsertAlertConfig };

const notifier = makeEmailNotifier();

app.use(
  "/api/v1/events",
  makeEventsRouter(eventsRepository, alertRepo, notifier),
);

app.use("/api/v1/sources", makeSourcesRouter(sourcesRepository));
app.use("/api/v1/alert", makeAlertRouter(alertRepo));
app.use("/api/v1/stats", makeStatsRouter(eventsRepository, sourcesRepository));

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Dev server listening at http://localhost:${config.port}`);
});
