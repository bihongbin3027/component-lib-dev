import React, { useState, useRef } from 'react';
import { Upload as UploadAntd, Space, message } from 'antd';
import { UploadChangeParam, UploadProps } from 'antd/es/upload';
import { UploadFile } from 'antd/es/upload/interface';
import { isEqualWith } from '../unrelated/utils';
import ConfigProvider from '../unrelated/ConfigProvider';
import { AnyObjectType } from '../unrelated/typings';
import './index.less';

export type PropsType = {
  /** 选择文件按钮 */
  children: JSX.Element;
  /** 设置上传的请求头部 */
  headers?: AnyObjectType;
  /** 上传成功回调 */
  uploadSuccess?: (data: UploadFile<any>[]) => void;
} & UploadProps;

/** 上传文件组件 */
function Upload(props: PropsType) {
  // 上传完成数量
  const uploadCompleteNum = useRef(0);
  const [fileList, setFileList] = useState<UploadProps['fileList']>([]);

  /**
   * @Description 上传文件转换-文件名使用encodeURIComponent编码
   * @Author bihongbin
   * @Date 2020-07-22 11:48:23
   */
  // const handleTransformFile = (file: File) => {
  //   return new Promise<File>((resolve) => {
  //     let fileArr = file.name.match(/\.([0-9a-z]+)(?:[?#]|$)/i);
  //     let last = file.name.lastIndexOf('.');
  //     let name = file.name.substr(0, last);
  //     if (fileArr) {
  //       resolve(new File([file], name + fileArr[0]));
  //     }
  //   });
  // };

  /**
   * @description 移除文件
   * @author bihongbin
   * @param {*}
   * @return {*}
   * @Date 2022-03-18 15:48:18
   */
  const removeFile = (file: UploadFile<any>) => {
    setFileList((prev) => {
      if (prev) {
        prev = prev.filter((item) => item.uid !== file.uid);
      }
      return prev;
    });
  };

  /**
   * @Description 上传文件改变时的状态
   * @Author bihongbin
   * @Date 2020-07-10 17:36:44
   */
  const handleChange = (fileObject: UploadChangeParam) => {
    const { status } = fileObject.file;
    const size = fileObject.fileList.length;
    message.destroy();
    console.log('上传的文件对象：', fileObject);

    const list = fileObject.fileList.map((item) => {
      const code = item.response && parseInt(item.response.code);
      if (code === -1 || code === 400 || code === 500) {
        item.status = 'error';
        // 上传失败提示
        message.warn(item.response.msg, 1.5);
      }
      return item;
    });

    if (status === 'done') {
      uploadCompleteNum.current = uploadCompleteNum.current + 1;
      console.log('上传文件总数量：', size);
      console.log('已完成数量：', uploadCompleteNum.current);
    }

    if (uploadCompleteNum.current === size && props.uploadSuccess) {
      const codeSuccess = list.filter((item) => {
        const code = item.response && parseInt(item.response.code);
        return code === 1;
      });
      if (codeSuccess.length === list.length) {
        message.success('上传成功', 1.5);
        props.uploadSuccess(codeSuccess);
      }
    }

    setFileList(list);
  };

  /**
   * @Description 点击文件链接或预览图标时的回调
   * @Author bihongbin
   * @Date 2020-07-10 18:20:05
   */
  const handlePreview = async (file: AnyObjectType) => {
    let src = file.url;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    if (imgWindow) {
      imgWindow.document.write(image.outerHTML);
    }
  };

  return (
    <ConfigProvider>
      <UploadAntd
        onChange={handleChange}
        onPreview={handlePreview}
        // beforeUpload={handleTransformFile}
        fileList={fileList}
        onRemove={removeFile}
        {...props}
      >
        {props.children}
      </UploadAntd>
    </ConfigProvider>
  );
}

export default React.memo(Upload, isEqualWith);
