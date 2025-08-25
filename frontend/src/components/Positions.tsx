import React from 'react';
import { Card, Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'react-bootstrap-icons';

type Position = {
    id: string;
    title: string;
    manager: string;
    deadline: string;
    status: 'Abierto' | 'Contratado' | 'Cerrado' | 'Borrador';
};

const mockPositions: Position[] = [
    { id: '1', title: 'Senior Full-Stack Engineer', manager: 'John Doe', deadline: '2024-12-31', status: 'Abierto' },
    { id: '2', title: 'Data Scientist', manager: 'Jane Smith', deadline: '2024-11-15', status: 'Abierto' }
];

const Positions: React.FC = () => {
    const navigate = useNavigate();
    return (
        <Container className="mt-4">
            {/* Header con botón de regreso */}
            <div className="d-flex align-items-center mb-4">
                <Button
                    variant="outline-secondary"
                    className="me-3"
                    onClick={() => navigate('/')}
                >
                    Volver
                </Button>
                <h2 className="mb-0">Posiciones</h2>
            </div>
            <Row className="mb-4">
                <Col md={3}>
                    <Form.Control type="text" placeholder="Buscar por título" />
                </Col>
                <Col md={3}>
                    <Form.Control type="date" placeholder="Buscar por fecha" />
                </Col>
                <Col md={3}>
                    <Form.Control as="select">
                        <option value="">Estado</option>
                        <option value="open">Abierto</option>
                        <option value="filled">Contratado</option>
                        <option value="closed">Cerrado</option>
                        <option value="draft">Borrador</option>
                    </Form.Control>
                </Col>
                <Col md={3}>
                    <Form.Control as="select">
                        <option value="">Manager</option>
                        <option value="john_doe">John Doe</option>
                        <option value="jane_smith">Jane Smith</option>
                        <option value="alex_jones">Alex Jones</option>
                    </Form.Control>
                </Col>
            </Row>
            <Row>
                {mockPositions.map((position, index) => (
                    <Col md={4} key={index} className="mb-4">
                        <Card className="shadow-sm">
                            <Card.Body>
                                <Card.Title>{position.title}</Card.Title>
                                <Card.Text>
                                    <strong>Manager:</strong> {position.manager}<br />
                                    <strong>Deadline:</strong> {position.deadline}
                                </Card.Text>
                                <span className={`badge ${position.status === 'Abierto' ? 'bg-warning' : position.status === 'Contratado' ? 'bg-success' : position.status === 'Borrador' ? 'bg-secondary' : 'bg-warning'} text-white`}>
                                    {position.status}
                                </span>
                                <div className="d-flex justify-content-between mt-3">
                                    <Link to={`/position/${position.id}`}>
                                        <Button variant="primary">Ver proceso</Button>
                                    </Link>
                                    <Button variant="secondary">Editar</Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default Positions;