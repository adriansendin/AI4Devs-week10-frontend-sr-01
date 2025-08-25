import React from 'react';
import { Card, Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const Positions: React.FC = () => {
  const navigate = useNavigate();
  const [positions, setPositions] = React.useState<Array<{ id: number; title: string; status: string; applicationDeadline?: string | null }>>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [deadlineFilter, setDeadlineFilter] = React.useState('');
  const [managerFilter, setManagerFilter] = React.useState('');

  React.useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('http://localhost:3010/position');
        if (!res.ok) throw new Error('Error cargando posiciones');
        const data = await res.json();
        setPositions(data);
      } catch (e: any) {
        setError(e.message || 'Error inesperado');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatDate = (iso?: string | null) => {
    if (!iso) return null;
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d.toLocaleDateString();
  };

  const toYMD = (iso?: string | null) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  // Asignación temporal y fija de manager para cada posición
  const getManagerFor = (p: { id: number }) => {
    if (p.id === 1) return 'Manager 1';
    if (p.id === 2) return 'Manager 2';
    return 'Manager 3';
  };

  const filtered = positions.filter(p => {
    const matchesTitle = p.title.toLowerCase().includes(search.trim().toLowerCase());
    const normalized = (p.status || '').toLowerCase();
    const matchesStatus = !statusFilter || normalized === statusFilter.toLowerCase();
    const matchesDate = !deadlineFilter || toYMD(p.applicationDeadline) === deadlineFilter;
    const managerName = getManagerFor(p);
    const matchesManager = !managerFilter || managerName === managerFilter;
    return matchesTitle && matchesStatus && matchesDate && matchesManager;
  });

  return (
    <Container className="mt-4">
      <div className="d-flex align-items-center mb-4">
        <Button variant="outline-secondary" className="me-3" onClick={() => navigate('/')}>
          Volver
        </Button>
        <h2 className="mb-0">Posiciones</h2>
      </div>

      <Row className="mb-4">
        <Col md={3}>
          <Form.Control
            type="text"
            placeholder="Buscar por título"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Control
            type="date"
            placeholder="Buscar por fecha"
            value={deadlineFilter}
            onChange={(e) => setDeadlineFilter(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Estado</option>
            <option value="Open">Abierto</option>
            <option value="Filled">Contratado</option>
            <option value="Closed">Cerrado</option>
            <option value="Draft">Borrador</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select value={managerFilter} onChange={(e) => setManagerFilter(e.target.value)}>
            <option value="">Manager</option>
            <option value="Manager 1">Manager 1</option>
            <option value="Manager 2">Manager 2</option>
            <option value="Manager 3">Manager 3</option>
          </Form.Select>
        </Col>
      </Row>

      {loading && <div>Loading...</div>}
      {error && <div className="text-danger">{error}</div>}

      {!loading && !error && (
        <Row>
          {filtered.map((position) => {
            const deadline = formatDate(position.applicationDeadline);
            const statusNorm = (position.status || '').toLowerCase();
            const badgeClass =
              ['abierto','open'].includes(statusNorm) ? 'bg-warning' :
              ['contratado','filled'].includes(statusNorm) ? 'bg-success' :
              ['cerrado','closed'].includes(statusNorm) ? 'bg-danger' :
              ['borrador','draft'].includes(statusNorm) ? 'bg-secondary' : 'bg-warning';
            const managerName = getManagerFor(position);

            return (
              <Col md={4} key={position.id} className="mb-4">
                <Card className="shadow-sm">
                  <Card.Body>
                    <Card.Title>{position.title}</Card.Title>
                    <Card.Text>
                      <strong>Manager:</strong> {managerName}<br />
                      {deadline && (<><strong>Deadline:</strong> {deadline}</>)}
                    </Card.Text>
                    <span className={`badge ${badgeClass} text-white`}>{position.status}</span>
                    <div className="d-flex justify-content-between mt-3">
                      <Link to={`/position/${position.id}`}>
                        <Button variant="primary">Ver proceso</Button>
                      </Link>
                      <Button variant="secondary" disabled>Editar</Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
};

export default Positions;