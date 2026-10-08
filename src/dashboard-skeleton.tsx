import { Card, Col, Row, Skeleton } from "antd";

/** DASH-01 loading skeleton — same layout as populated/empty Overview. */
function DashboardSkeleton() {
  return (
    <>
      <Row gutter={[12, 12]} className="dash-kpi-row">
        {Array.from({ length: 5 }).map((_, index) => (
          <Col
            xs={12}
            sm={8}
            md={4}
            lg={4}
            xl={4}
            key={`kpi-skel-${index}`}
            className="dash-kpi-col"
          >
            <Card className="dash-kpi dash-kpi--skeleton">
              <Skeleton
                active
                title={{ width: "40%" }}
                paragraph={{ rows: 1, width: ["55%"] }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} className="dash-main-row">
        <Col xs={24} lg={16} className="dash-main-col">
          <Card className="dash-card" title="Live Queue">
            <div className="dash-skel-queue">
              {Array.from({ length: 4 }).map((_, index) => (
                <div className="dash-skel-queue__row" key={`queue-skel-${index}`}>
                  <Skeleton.Input active size="small" className="dash-skel-queue__time" />
                  <Skeleton active title={{ width: "35%" }} paragraph={{ rows: 1, width: ["25%"] }} />
                  <Skeleton.Button active size="small" shape="round" />
                  <Skeleton.Button active size="small" shape="round" />
                  <Skeleton.Button active size="small" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="dash-card" title="Employees">
            <div className="dash-skel-list">
              <Skeleton active title={{ width: "100%" }} paragraph={{ rows: 1, width: ["80%"] }} />
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8} className="dash-rail-col">
          <Card className="dash-card" title="Payments today">
            <div className="dash-skel-list">
              <Skeleton active title={{ width: "100%" }} paragraph={{ rows: 3, width: ["100%", "90%", "80%"] }} />
            </div>
          </Card>

          <Card className="dash-card" title="Prescriptions">
            <div className="dash-skel-list">
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton
                  key={`rx-skel-${index}`}
                  active
                  avatar={false}
                  title={{ width: "40%" }}
                  paragraph={{ rows: 1, width: ["60%"] }}
                />
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default DashboardSkeleton;
