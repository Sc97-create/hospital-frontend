import { Card, Skeleton, Space } from "antd";

/** Loading skeleton — mirrors prescription detail layout (patient header + medicine table). */
function PrescriptionPreviewSkeleton() {
  return (
    <>
      <Card className="patient-card rx-skel-patient">
        <div className="rx-skel-patient__row">
          <Space size={16} align="center">
            <Skeleton.Avatar active size={56} />
            <Skeleton
              active
              title={{ width: 160 }}
              paragraph={{ rows: 1, width: [120] }}
            />
          </Space>
          <div className="rx-skel-patient__meta">
            <Skeleton active title={{ width: 72 }} paragraph={{ rows: 1, width: [100] }} />
            <Skeleton active title={{ width: 72 }} paragraph={{ rows: 1, width: [90] }} />
          </div>
        </div>
      </Card>

      <Card className="medicine-table-card">
        <div className="table-header">
          <Space>
            <Skeleton.Input active size="small" style={{ width: 180 }} />
            <Skeleton.Button active size="small" shape="round" />
          </Space>
        </div>

        <div className="rx-skel-table">
          <div className="rx-skel-table__head">
            {["Medicine", "Dosage", "Schedule", "Duration", "Qty"].map((label) => (
              <span key={label} className="rx-skel-table__col-label">
                {label}
              </span>
            ))}
          </div>
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="rx-skel-table__row" key={`rx-row-skel-${index}`}>
              <Skeleton active title={{ width: "70%" }} paragraph={{ rows: 1, width: ["50%"] }} />
              <Skeleton.Input active size="small" />
              <Space size={4}>
                <Skeleton.Button active size="small" shape="round" />
                <Skeleton.Button active size="small" shape="round" />
                <Skeleton.Button active size="small" shape="round" />
              </Space>
              <Skeleton.Input active size="small" />
              <Skeleton.Input active size="small" style={{ width: 40 }} />
            </div>
          ))}
        </div>

      </Card>

      <div className="sticky-footer rx-skel-footer">
        <Space>
          <Skeleton.Button active />
          <Skeleton.Button active />
        </Space>
        <Space>
          <Skeleton.Button active />
          <Skeleton.Button active />
          <Skeleton.Button active />
        </Space>
      </div>
    </>
  );
}

export default PrescriptionPreviewSkeleton;
