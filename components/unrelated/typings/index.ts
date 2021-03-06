import { AxiosRequestConfig } from 'axios';
import React from 'react';

// 从类型 T 中排除是 K 的类型
export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

export type AnyObjectType = {
  [key: string]: any;
};

export type PromiseAxiosResultType = Promise<AjaxResultType>;

export type SubmitApiType = (
  data: AnyObjectType,
  method: AxiosRequestConfig['method'],
) => Promise<AjaxResultType<AnyObjectType>>;

export type RequestPageType =
  | {
      page: number;
      size: number;
    }
  | AnyObjectType
  | undefined;

export type ResultPageType<T = any[]> = {
  content: T;
  page: string;
  pageShowFlag: boolean;
  pages: string;
  total: string;
  sort: any[];
  size: string;
};

export interface SelectType {
  label: string | React.ReactNode;
  value: string | number;
  children?: SelectType[];
}

export interface AjaxResultType<T = any> {
  code: number;
  data: T;
  msg: string;
  total?: number;
}

// 挂起、启用
export interface SetRowStateType {
  ids: string[];
  type: 'pending' | 'recover';
}

export type SetStateType<T = AnyObjectType> = (
  patch: Partial<T> | ((prevState: T) => Partial<T>),
) => void;
