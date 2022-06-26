import electron from "electron";
import React from "react";
import SplitterLayout from "react-splitter-layout";
import QuerySharing from "../../../lib/QuerySharing";
import { store } from "./QueryStore";
import Action from "./QueryAction";
import { useFluxState } from "../../flux/useFluxState";
import QueryList from "../../components/QueryList";
import QueryHeader from "../../components/QueryHeader";
import QueryEditor from "../../components/QueryEditor";
import QueryResult from "../../components/QueryResult";
import { QueryType } from "../../../lib/Database/Query";
import { DataSourceType } from "../DataSource/DataSourceStore";
import DataSource from "../../../lib/DataSource";

const Query: React.FC = () => {
  const state = useFluxState(store);

  React.useEffect(() => {
    Action.initialize();
  }, []);

  const handleAddQuery = (): void => {
    const defaultDataSourceId = state.setting.defaultDataSourceId;
    const ds = defaultDataSourceId !== null ? findDataSourceById(defaultDataSourceId) : state.dataSources[0];
    if (ds) {
      Action.addNewQuery({ dataSourceId: ds.id });
    } else {
      alert("Please create data source");
    }
  };

  const findDataSourceById = (id: number): DataSourceType | undefined => {
    return state.dataSources.find((ds) => ds.id === id);
  };

  const handleExecute = async (query: QueryType): Promise<void> => {
    const line = state.editor.line ?? 0;
    const dataSource = findDataSourceById(query.dataSourceId);
    if (dataSource) {
      await Action.executeQuery({ query, dataSource, line });
    } else {
      alert("DataSource is missing");
    }
  };

  const handleCancel = async (query: QueryType): Promise<void> => {
    if (query.status === "working") {
      await Action.cancelQuery(query);
    }
  };

  const handleShareOnGist = async (query: QueryType): Promise<void> => {
    const chart = state.charts.find((chart) => chart.queryId === query.id);
    const setting = state.setting.github;
    const dataSource = state.dataSources.find((ds) => ds.id === query.dataSourceId);

    if (!setting.token) {
      alert("Set your Github token");
      return;
    }
    if (!dataSource) {
      alert("DataSource is not selected");
      return;
    }

    try {
      await QuerySharing.shareOnGist({ query, chart, setting, dataSource });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleShareOnBdashServer = async (query: QueryType): Promise<void> => {
    const chart = state.charts.find((chart) => chart.queryId === query.id);
    const setting = state.setting.bdashServer;
    const dataSource = state.dataSources.find((ds) => ds.id === query.dataSourceId);

    if (!setting.token) {
      alert("Set your Bdash Server's access token");
      return;
    }
    if (!dataSource) {
      alert("DataSource is not selected");
      return;
    }

    let overwrite: { idHash: string } | undefined;
    if (query.bdashServerQueryId) {
      const response = electron.ipcRenderer.sendSync("showUpdateQueryDialog");
      if (response === "cancel") return;
      if (response === "update") {
        overwrite = { idHash: query.bdashServerQueryId };
      }
    }

    try {
      const { id: bdashServerQueryId, html_url } = await QuerySharing.shareOnBdashServer({
        query,
        chart,
        setting,
        dataSource,
        overwrite,
      });
      await electron.shell.openExternal(html_url);
      if (bdashServerQueryId) {
        await Action.updateQuery(query.id, { bdashServerQueryId });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleShowSharedQueryOnBdashServer = async (query: QueryType): Promise<void> => {
    await QuerySharing.showSharedQueryOnBdashServer({ query, setting: state.setting.bdashServer });
  };

  const renderMain = (): React.ReactNode => {
    const query = state.queries.find((query) => query.id === state.selectedQueryId);
    if (!query) return <div className="page-Query-main" />;
    const dataSource = state.dataSources.find((dataSource) => dataSource.id === query.dataSourceId);
    const dataSourceDef = dataSource ? DataSource.get(dataSource.type) : null;

    return (
      <div className="page-Query-main">
        <QueryHeader
          query={query}
          {...state}
          onChangeTitle={(title): void => {
            Action.updateQuery(query.id, { title });
          }}
          onChangeDataSource={(dataSourceId): void => {
            Action.updateQuery(query.id, { dataSourceId });
          }}
        />
        <SplitterLayout
          vertical={true}
          primaryIndex={1}
          primaryMinSize={100}
          secondaryMinSize={100}
          customClassName="page-Query-splitter-layout"
        >
          <QueryEditor
            query={query}
            tables={dataSource?.tables ?? []}
            mimeType={dataSource?.mimeType ?? "text/x-sql"}
            formatType={dataSourceDef?.formatType ?? "sql"}
            {...state}
            onChangeQueryBody={(body, codeMirrorHistory): void => {
              Action.updateQuery(query.id, { body, codeMirrorHistory: codeMirrorHistory });
            }}
            onChangeCursorPosition={(line): void => Action.updateEditor({ line })}
            onExecute={(): void => {
              handleExecute(query);
            }}
            onCancel={(): void => {
              handleCancel(query);
            }}
          />
          <QueryResult
            query={query}
            {...state}
            onClickCopyAsJson={(): void => {
              QuerySharing.copyAsJson(query);
            }}
            onClickCopyAsTsv={(): void => {
              QuerySharing.copyAsTsv(query);
            }}
            onClickCopyAsCsv={(): void => {
              QuerySharing.copyAsCsv(query);
            }}
            onClickCopyAsMarkdown={(): void => QuerySharing.copyAsMarkdown(query)}
            onClickShareOnGist={(): void => {
              handleShareOnGist(query);
            }}
            onClickShareOnBdashServer={(): void => {
              handleShareOnBdashServer(query);
            }}
            onClickShowSharedQueryOnBdashServer={(): void => {
              handleShowSharedQueryOnBdashServer(query);
            }}
            onSelectTab={(name): void => {
              Action.selectResultTab(query, name);
            }}
            onUpdateChart={Action.updateChart}
          />
        </SplitterLayout>
      </div>
    );
  };

  const render = () => {
    return (
      <div className="page-Query">
        <div className="page-Query-list">
          <QueryList
            {...state}
            onAddQuery={(): void => {
              handleAddQuery();
            }}
            onSelectQuery={Action.selectQuery}
            onDuplicateQuery={Action.duplicateQuery}
            onDeleteQuery={Action.deleteQuery}
          />
        </div>
        {renderMain()}
      </div>
    );
  };

  return render();
};

export default Query;
