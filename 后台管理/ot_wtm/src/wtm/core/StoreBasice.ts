/**
 * @author 冷 (https://github.com/LengYXin)
 * @email lengyingxin8966@gmail.com
 * @create date 2018-09-12 18:52:27
 * @modify date 2018-09-12 18:52:27
 * @desc [description] .
 */
import { message } from 'antd';
import { action, computed, observable, runInAction } from 'mobx';
import NProgress from 'nprogress';
// import wtmfront from '@WTMConfig';
import Common from './Common';
import { HttpBasics } from './HttpBasics';
import SwaggerModel from "./SwaggerModel";
// const { include } = wtmfront;
export default class Store {
  constructor(public StoreConfig) {

  }
  /** 数据 ID 索引 */
  protected IdKey = 'id'
  /** 页面操按钮 */
  Actions: WTM.IActions = {
    insert: {
      state: true,
      name: "添加"
    },
    update: {
      state: true,
      name: "修改"
    },
    delete: {
      state: true,
      name: "删除"
    },
    import: {
      state: true,
      name: "导入"
    },
    export: {
      state: true,
      name: "导出"
    },
  }
  /** url 地址 */
  Urls: WTM.IUrls = {
    search: {
      src: "/test/search",
      method: "post"
    },
    details: {
      src: "/test/details/{id}",
      method: "get"
    },
    insert: {
      src: "/test/insert",
      method: "post"
    },
    update: {
      src: "/test/update",
      method: "post"
    },
    delete: {
      src: "/test/delete",
      method: "post"
    },
    import: {
      src: "/test/import",
      method: "post"
    },
    export: {
      src: "/test/export",
      method: "post"
    },
    template: {
      src: "/test/template",
      method: "post"
    }
  };
  /** 公共数据类 */
  Common = Common
  /** 格式化数据参数 */
  Format = {
    date: "YYYY-MM-DD",
    dateTime: "YYYY-MM-DD HH:mm:ss",
  }
  /** swagger数据模型 */
  SwaggerModel = new SwaggerModel(this.StoreConfig.Swagger);
  /** Ajax   */
  Request = new HttpBasics();
  /** 搜索数据参数 */
  searchParams: any = {

  }
  /** 数据列表 */
  @observable dataSource = {
    count: 0,
    list: [],
    pageNo: 1,
    pageSize: 10
  }
  /** 多选行 key */
  @observable selectedRowKeys = [];
  /**  详情 */
  @observable details: any = {};
  /** 页面动作 */
  @observable pageState = {
    visibleEdit: false,//编辑显示
    visiblePort: false,//导入显示
    loading: false,//数据加载
    loadingEdit: false,//数据提交
    isUpdate: false//编辑状态
  }
  /**
   *  修改页面动作状态
   * @param key 
   * @param value 
   */
  @action.bound
  onPageState(key: "visibleEdit" | "visiblePort" | "loading" | "loadingEdit" | "isUpdate", value?: boolean) {
    const prevVal = this.pageState[key];
    if (prevVal == value) {
      return
    }
    if (typeof value == "undefined") {
      value = !prevVal;
    }
    this.pageState[key] = value;
  }
  /**
   * 多选 行 
   * @param selectedRowKeys 选中的keys
   */
  @action.bound
  onSelectChange(selectedRowKeys) {
    this.selectedRowKeys = selectedRowKeys
  }
  /**
   * 编辑
   * 需要重写的方法 使用 runInAction 实现 修改Store
   * 使用 @action.bound 装饰器的方法不可重写
   * @param details 详情 有唯一 key 判定为修改
   */
  async onModalShow(details = {}) {
    if (details[this.IdKey] == null) {
      this.onPageState("isUpdate", false)
    } else {
      this.onPageState("isUpdate", true)
      details = await this.onDetails(details)
    }
    runInAction(() => {
      this.details = details
    })
    this.onPageState("visibleEdit", true)
  }

  /**
   * 加载数据 列表
   * @param search 搜索条件 
   * @param sort 排序字段
   * @param pageNo 页码
   * @param pageSize 数据条数
   */
  async onSearch(search: any = {}, sort: string = "", pageNo: number = 1, pageSize: number = 10) {
    if (this.pageState.loading == true) {
      return message.warn('数据正在加载中')
    }
    this.onPageState("loading", true);
    this.searchParams = { ...this.searchParams, ...search };
    search = {
      pageNo,
      pageSize,
      sort,
      search: this.searchParams
    }
    const method = this.Urls.search.method;
    const src = this.Urls.search.src;
    const res = await this.Request[method](src, search).map(data => {
      if (data.list) {
        data.list = data.list.map((x, i) => {
          // antd table 列表属性需要一个唯一key
          return { key: i, ...x }
        })
      } else {
        message.warn('返回数据并为标准table数据类型')
      }
      return data
    }).toPromise()
    runInAction(() => {
      this.dataSource = res || this.dataSource
      this.onPageState("loading", false)
    })
    return res
  }
  /**
   * 详情
   * @param params 数据实体
   */
  async onDetails(params) {
    this.onPageState("loadingEdit", true)
    const method = this.Urls.details.method;
    const src = this.Urls.details.src;
    const res = await this.Request[method](src, params).toPromise()
    this.onPageState("loadingEdit", false)
    return res || {}
  }
  /**
   * 编辑数据
   * @param params 数据实体
   */
  async onEdit(params) {
    if (this.pageState.loadingEdit) {
      return
    }
    const details = { ...this.details, ...params }
    this.onPageState("loadingEdit", true)
    // 添加 | 修改
    if (this.pageState.isUpdate) {
      return await this.onUpdate(details)
    }
    return await this.onInsert(details)
  }
  /**
   * 添加数据
   * @param params 数据实体
   */
  async onInsert(params) {
    const method = this.Urls.insert.method;
    const src = this.Urls.insert.src;
    const res = await this.Request[method](src, params).toPromise()
    if (res) {
      message.success('添加成功')
      // 刷新数据
      this.onSearch()
      this.onPageState("visibleEdit", false)
    } else {
      message.error('添加失败')
    }
    this.onPageState("loadingEdit", false)
    return res
  }
  /**
   * 更新数据
   * @param params 数据实体
   */
  async onUpdate(params) {
    const method = this.Urls.update.method;
    const src = this.Urls.update.src;
    const res = await this.Request[method](src, params).toPromise()
    if (res) {
      message.success('更新成功')
      // 刷新数据
      this.onSearch()
      this.onPageState("visibleEdit", false)
    } else {
      message.error('更新失败')
    }
    this.onPageState("loadingEdit", false)
    return res
  }
  /**
   * 删除数据
   * @param params 需要删除的数据集合 取 所有的 id
   */
  async onDelete(params: any[]) {
    params = params.map(x => x[this.IdKey])
    const method = this.Urls.delete.method;
    const src = this.Urls.delete.src;
    const res = await this.Request[method](src, params).toPromise()
    if (res) {
      message.success('删除成功')
      this.onSelectChange([]);
      // 刷新数据
      this.onSearch();
    } else {
      message.success('删除失败')
    }
    return res
  }
  /**
   * 导入 配置 参数
   * https://ant.design/components/upload-cn/#components-upload-demo-picture-style
   */
  @computed
  get importConfig() {
    const action = this.Request.compatibleUrl(this.Request.address, this.Urls.import.src)
    return {
      name: 'file',
      multiple: true,
      action: action,
      onChange: info => {
        const status = info.file.status
        // NProgress.start();
        if (status !== 'uploading') {
          console.log(info.file, info.fileList)
        }
        if (status === 'done') {
          const response = info.file.response
          // NProgress.done();
          if (response.status == 200) {
            // 刷新数据
            this.onSearch();
            message.success(`${info.file.name} file uploaded successfully.`)
          } else {
            message.error(`${info.file.name} ${response.message}`)
          }
        } else if (status === 'error') {
          message.error(`${info.file.name} file upload failed.`)
        }
      }
    }
  }
  /**
   * 导出
   * @param params 筛选参数
   */
  async onExport(params = this.searchParams) {
    await this.Request.download({
      url: this.Urls.export.src,
      body: params
    })
  }
  /**
  * 数据模板
  */
  async onTemplate() {
    await this.Request.download({
      url: this.Urls.template.src,
    })
  }
}
