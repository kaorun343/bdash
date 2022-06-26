import React from "react";
import { store, DataSourceType } from "./DataSourceStore";
import Action from "./DataSourceAction";
import { useFluxState } from "../../flux/useFluxState";
import DataSourceList from "../../components/DataSourceList";
import TableList from "../../components/TableList";
import TableSummary from "../../components/TableSummary";
import DataSourceForm from "../../components/DataSourceForm";

const DataSource: React.FC = () => {
  const state = useFluxState(store);

  React.useEffect(() => {
    Action.initialize();
  }, []);

  const find = (id: number) => {
    return state.dataSources.find((d) => d.id === id);
  };

  const handleSave = (dataSource: { id: number | null } & Pick<DataSourceType, "name" | "type" | "config">) => {
    if (dataSource.id !== null) {
      Action.updateDataSource({ ...dataSource, id: dataSource.id });
    } else {
      Action.createDataSource(dataSource);
    }
  };

  const renderDataSourceForm = () => {
    if (!state.showForm) return;

    return <DataSourceForm dataSource={state.formValue} onSave={handleSave} onCancel={Action.hideForm} />;
  };

  const render = () => {
    const dataSource = find(state.selectedDataSourceId ?? -1);
    const defaultDataSourceId = state.setting.defaultDataSourceId ?? state.dataSources[0]?.id;

    return (
      <div className="page-DataSource">
        <div className="page-DataSource-list">
          <DataSourceList
            {...state}
            defaultDataSourceId={defaultDataSourceId}
            onClickNew={Action.showForm}
            onSelect={Action.selectDataSource}
            onEdit={Action.showForm}
            onDelete={Action.deleteDataSource}
            onReload={Action.reloadTables}
            changeDefaultDataSourceId={Action.updateDefaultDataSourceId}
          />
        </div>
        <div className="page-DataSource-tableList">
          <TableList
            dataSource={dataSource}
            onSelectTable={Action.selectTable}
            onChangeTableFilter={Action.changeTableFilter}
          />
        </div>
        <div className="page-DataSource-tableSummary">
          <TableSummary dataSource={dataSource} {...state} />
        </div>
        {renderDataSourceForm()}
      </div>
    );
  };

  return render();
};

export default DataSource;
