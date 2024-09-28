import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import { useState } from 'react';
import { FeatureStatus } from '../types';
import { getSecureHarnessKey } from '../utils/getHarnessToken';

interface useGetFeatureStatusEnv {
  accountId: string;
  orgId: string;
  projectId: string;
  envId: string;
  backendBaseUrl: Promise<string>;
  refresh: boolean;
  envFromUrl: string;
}

const useGetFeatureStatus = ({
  accountId,
  projectId,
  envId,
  orgId,
  backendBaseUrl,
  refresh,
  envFromUrl,
}: useGetFeatureStatusEnv) => {
  const [featureStatusMap, setFeatureStatusMap] = useState<
    Record<string, FeatureStatus>
  >({});
  const [loading, setLoading] = useState(false);

  useAsyncRetry(async () => {
    if (!envId) {
      return;
    }
    const query = new URLSearchParams({
      routingId: `${accountId}`,
      projectIdentifier: `${projectId}`,
      environmentIdentifier: `${envId}`,
      accountIdentifier: `${accountId}`,
      orgIdentifier: `${orgId}`,
    });

    const token = getSecureHarnessKey('token');

    const headers = new Headers({
      'content-type': 'application/json',
      Authorization: token ? `${token}` : '',
    });

    setLoading(true);

    const resp = await fetch(
      `${await backendBaseUrl}/harness/${envFromUrl}/gateway/cf/admin/features/metrics?${query}&pageSize=100&pageNumber=0&metrics=false&flagCounts=true&name=&summary=true`,
      {
        headers,
      },
    );

    if (resp.status === 200) {
      const data = await resp.json();

      const getFeatureStatusMap = () => {
        const featureMap: Record<string, FeatureStatus> = {};
        data.forEach((d: FeatureStatus) => {
          featureMap[d.identifier] = d;
        });
        return featureMap;
      };

      setFeatureStatusMap(getFeatureStatusMap());
      // setCurrTableData(getFeatureList());
    }
    setLoading(false);
  }, [accountId, projectId, envId, orgId, refresh, envFromUrl]);

  return { featureStatusMap, loading };
};

export default useGetFeatureStatus;
