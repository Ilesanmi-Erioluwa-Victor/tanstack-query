import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { startTransition, useState } from 'react';
import type { IRequestError, IRequestSuccess } from '../request';
import { makeRequest } from '../request';
import type { IPagination, TanstackQueryOption } from './queries.interface';

export const useGetRequest = <TResponse extends Record<string, any>>({
  path,
  load = false,
  queryOptions,
}: {
  path: string;
  load?: boolean;
  queryOptions?: TanstackQueryOption<TResponse>;
}) => {
  const [requestPath, updatePath] = useState<string>(path);
  const authToken = '';
  const [options, setOptions] = useState<any>(queryOptions);
  const [page, setPage] = useState<number>(1);

  const sendRequest = async (
    res: (
      value:
        | IRequestError
        | IRequestSuccess<TResponse>
        | PromiseLike<IRequestError | IRequestSuccess<TResponse>>
    ) => void,
    rej: (reason?: any) => void
  ) => {
    const postResponse = await makeRequest<TResponse>({
      path: requestPath,
      bearerToken: authToken,
    });
    if (postResponse.status) {
      res(postResponse as IRequestSuccess<TResponse>);
    } else {
      rej(postResponse);
    }
  };

  const query = useQuery<any, any, IRequestSuccess<TResponse>>(
    [requestPath, {}],
    () =>
      new Promise<IRequestSuccess<TResponse> | IRequestError>((res, rej) => {
        return sendRequest(res, rej);
      }),
    {
      enabled: load,
      ...options,
    }
  );

  const nextPage = () => {
    if (query.data?.data.pagination) {
      const pagination: IPagination = query.data.data.pagination;
      if (
        pagination.next_page !== pagination.current_page &&
        pagination.next_page > pagination.current_page
      ) {
        updatePath(constructPaginationLink(requestPath, pagination.next_page));
      }
    }
  };

  const prevPage = () => {
    if (query.data?.data.pagination) {
      const pagination: IPagination = query.data.data.pagination;
      if (
        pagination.previous_page !== pagination.current_page &&
        pagination.previous_page < pagination.current_page
      ) {
        updatePath(
          constructPaginationLink(requestPath, pagination.previous_page)
        );
      }
    }
  };

  const constructPaginationLink = (link: string, pageNumber: number) => {
    const oldLink = link;
    if (link.includes('?')) {
      if (link.includes('?page=')) {
        // replace current page number with new number
        link = link.replace(/\?page=(\d+)/gim, `?page=${pageNumber}`);
      } else if (link.includes('&page=')) {
        link = link.replace(/&page=(\d+)/gim, `&page=${pageNumber}`);
      } else {
        link = `${link}&page=${pageNumber}`;
      }
    } else {
      link = `${link}?page=${pageNumber}`;
    }

    // only update page when pagination is done
    if (oldLink !== link) {
      setPage(pageNumber);
    }
    return link;
  };

  const gotoPage = (pageNumber: number) => {
    updatePath(constructPaginationLink(requestPath, pageNumber));
  };

  const updatedPathAsync = async (link: string) => {
    startTransition(() => {
      updatePath(link);
    });
  };

  const setOptionsAsync = async (fetchOptions: any) => {
    startTransition(() => {
      setOptions(fetchOptions);
    });
  };

  const get = async (
    link: string,
    fetchOptions?: UseQueryOptions<
      IRequestSuccess<TResponse | undefined>,
      IRequestError,
      IRequestSuccess<TResponse | undefined>,
      Array<any>
    >
  ): Promise<IRequestSuccess<TResponse> | undefined> => {
    await setOptionsAsync(fetchOptions);
    await updatedPathAsync(link);

    return query.data;
  };

  return {
    ...query,
    updatePath,
    nextPage,
    prevPage,
    get,
    gotoPage,
    page,
    queryKey: [requestPath, {}],
  };
};
