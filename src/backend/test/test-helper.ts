import * as Moment from "moment";
import { FakeSQL } from "./fake-sql";

/**
 * Class of miscellaneous test help functions.
 *
 * TODO: Very tied to the MySQLService and FakeSQLService implementations.
 */
export class TestReplaceHelper {
    /**
     * Execute a 'REPLACE INTO' call onto a MySQL database
     *
     * @param queryFunction The function to call that will make the replacement
     * @param table         The table to do the replacement in
     * @param data          The data to use
     */
    public static replace(
      queryFunction: (queryString: string, prepare: any[]) => Promise<any>,
      table: string,
      data: any
    ) {
      // Create questions array
      const questions = [];
      for (const item of Object.keys(data)) {
          questions.push("?");
      }

      // Construct query function
      return queryFunction(`REPLACE INTO ${table} (${Object.keys(data).join()})
        VALUES (${questions.join()})`, Object.keys(data).map((key) => data[key]));
    }

    public static replaceParallel(
      queryFunction: (queryString: string, prepare: any[]) => Promise<any>,
      table: string,
      data: any
    ) {
      let dataArr: any[];
      if (Array.isArray(data) === false) {
          dataArr = [data];  // Convert to array
      } else {
          dataArr = data as object[];
      }

      // Stub to make FakeSQL quiet
      const temp = FakeSQL.response;
      FakeSQL.response = {};
      const promises = [];
      for (const dataEntry of dataArr) {
          // Stack on all the promises
          promises.push(TestReplaceHelper.replace(queryFunction, table, dataEntry));
      }
      return Promise.all(promises).then(() => FakeSQL.response = temp);
    }

    /**
     * Execute a 'REPLACE INTO' call onto a MySQL database, handling date conversions
     *
     * @param queryFunction The function to call that will make the replacement
     * @param table         The table to do the replacement in
     * @param dataInfo      The data to use
     * @param field         The field with a date in it that needs conversion
     */
    public static dateReplace(
      queryFunction: (queryString: string, prepare: any[]) => Promise<any>,
      table: string,
      dataInfo: object | object[],
      field: string
    ) {
      let dataArr: any[];
      if (Array.isArray(dataInfo) === false) {
          dataArr = [dataInfo];  // Convert to array
      } else {
          dataArr = dataInfo as object[];
      }

      // Stub to make FakeSQL quiet
      const temp = FakeSQL.response;
      FakeSQL.response = {};
      // TODO: This ^ creates a race condition if there are more than one calls to this function at once

      const promises = [];
      for (const data of dataArr) {
          // Swap out date types
          const tempData = data[field];
          data[field] = Moment(data[field]).format("YYYY-MM-DD HH:mm:ss");

          // Stack on all the promises
          promises.push(
              TestReplaceHelper.replace(queryFunction, table, data)
              .then(() => {
                  FakeSQL.response = temp;
                  data[field] = tempData;
              })
          );
      }
      return Promise.all(promises);
    }
}
