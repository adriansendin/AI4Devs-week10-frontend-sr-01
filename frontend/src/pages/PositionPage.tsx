import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { ArrowLeft, Star } from 'react-bootstrap-icons';

// Tipos de datos
interface InterviewStep {
  id: number;
  name: string;
  orderIndex: number;
}

interface InterviewFlow {
  id: number;
  description: string;
  interviewSteps: InterviewStep[];
}

interface Candidate {
  id: string;
  fullName: string;
  currentInterviewStep: string;
  averageScore: number;
  applicationId: string;
}

interface PositionData {
  positionName: string;
  interviewFlow: InterviewFlow;
}

interface CandidatesData {
  [key: string]: Candidate[];
}

const PositionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Estados
  const [positionData, setPositionData] = useState<PositionData | null>(null);
  const [candidates, setCandidates] = useState<CandidatesData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingCandidate, setUpdatingCandidate] = useState<string | null>(null);

  // Función para obtener los datos de la posición
  const fetchPositionData = async () => {
    try {
      const response = await fetch(`http://localhost:3010/position/${id}/interviewflow`);
      if (!response.ok) {
        throw new Error('Error al cargar los datos de la posición');
      }
      const data = await response.json();
      
      // Ajustar la estructura de datos para manejar la respuesta anidada del backend
      const positionData = data.interviewFlow || data;
      setPositionData(positionData);
      
      // Inicializar el estado de candidatos con las fases
      const initialCandidates: CandidatesData = {};
      positionData.interviewFlow.interviewSteps.forEach((step: InterviewStep) => {
        initialCandidates[step.name] = [];
      });
      setCandidates(initialCandidates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  // Función para obtener los candidatos
  const fetchCandidates = async () => {
    try {
      const response = await fetch(`http://localhost:3010/position/${id}/candidates`);
      if (!response.ok) {
        throw new Error('Error al cargar los candidatos');
      }
      const candidatesData: Candidate[] = await response.json();
      
      console.log('Candidatos recibidos:', candidatesData);
      
      // Organizar candidatos por fase
      const organizedCandidates: CandidatesData = {};
      
      // Inicializar todas las fases con arrays vacíos
      if (positionData?.interviewFlow.interviewSteps) {
        positionData.interviewFlow.interviewSteps.forEach((step: InterviewStep) => {
          organizedCandidates[step.name] = [];
        });
      }
      
      // Asignar candidatos a sus fases correspondientes
      candidatesData.forEach(candidate => {
        if (organizedCandidates[candidate.currentInterviewStep]) {
          organizedCandidates[candidate.currentInterviewStep].push(candidate);
        }
      });
      
      console.log('Candidatos organizados:', organizedCandidates);
      setCandidates(organizedCandidates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar la fase del candidato
  const updateCandidateStage = async (candidateId: string, applicationId: string, newStepId: string) => {
    try {
      console.log('Updating candidate stage:', { candidateId, applicationId, newStepId });
      
      const response = await fetch(`http://localhost:3010/candidates/${candidateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: applicationId,
          currentInterviewStep: newStepId
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la fase del candidato');
      }

      const result = await response.json();
      console.log('Update result:', result);
      return result;
    } catch (error) {
      console.error('Error updating candidate stage:', error);
      throw error;
    }
  };

  // Función para manejar el drag & drop
  const handleDragEnd = (result: any) => {
    const { source, destination, draggableId } = result;

    console.log('Drag end result:', result);

    // Si no hay destino válido, no hacer nada
    if (!destination) {
      console.log('No destination, returning');
      return;
    }

    // Si el candidato se soltó en la misma posición, no hacer nada
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      console.log('Same position, returning');
      return;
    }

    // Encontrar el candidato que se está moviendo
    const sourceCandidates = candidates[source.droppableId];
    if (!sourceCandidates) {
      console.log('Source candidates not found:', source.droppableId);
      return;
    }

    const candidate = sourceCandidates[source.index];
    if (!candidate) {
      console.log('Candidate not found at index:', source.index);
      return;
    }

    console.log('Moving candidate:', candidate.fullName, 'from', source.droppableId, 'to', destination.droppableId);
    
    // Encontrar el ID de la nueva fase
    const newStep = positionData?.interviewFlow.interviewSteps.find(
      step => step.name === destination.droppableId
    );

    if (candidate && newStep) {
      // Actualizar el estado local inmediatamente para una mejor UX
      const newCandidates = { ...candidates };
      
      // Remover candidato de la fuente
      newCandidates[source.droppableId] = sourceCandidates.filter((_, index) => index !== source.index);
      
      // Agregar candidato al destino
      if (!newCandidates[destination.droppableId]) {
        newCandidates[destination.droppableId] = [];
      }
      
      // Crear una copia del candidato con la nueva fase
      const updatedCandidate = {
        ...candidate,
        currentInterviewStep: destination.droppableId
      };
      
      newCandidates[destination.droppableId].splice(destination.index, 0, updatedCandidate);
      
      setCandidates(newCandidates);
      
      // Llamar a la API para actualizar en el backend
      updateCandidateStage(candidate.id.toString(), candidate.applicationId, newStep.id.toString());
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      await fetchPositionData();
    };
    loadData();
  }, [id]);

  // Ejecutar fetchCandidates cuando positionData esté disponible
  useEffect(() => {
    if (positionData) {
      fetchCandidates();
    }
  }, [positionData]);

  // Renderizar estrellas para la puntuación
  const renderStars = (score: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={i <= score ? 'text-warning' : 'text-muted'}
          size={12}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!positionData) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">No se encontraron datos de la posición</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      {/* Header con título y botón de regreso */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center">
            <Button
              variant="outline-secondary"
              className="me-3"
              onClick={() => navigate('/positions')}
            >
              <ArrowLeft /> Volver
            </Button>
            <h2 className="mb-0">{positionData.positionName}</h2>
          </div>
        </Col>
      </Row>

      {/* Tablero Kanban */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Row className="kanban-board">
          {positionData.interviewFlow.interviewSteps.map((step) => (
            <Col key={step.id} className="mb-4">
              <Card className="h-100">
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">{step.name}</h5>
                  <small>
                    {candidates[step.name]?.length || 0} candidatos
                  </small>
                </Card.Header>
                <Card.Body className="p-2">
                  <Droppable droppableId={step.name}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-height-200 ${snapshot.isDraggingOver ? 'bg-light' : ''}`}
                        style={{ minHeight: '200px' }}
                      >
                        {candidates[step.name]?.map((candidate, index) => (
                          <Draggable
                            key={`${candidate.id}-${index}`}
                            draggableId={`${candidate.id}-${index}`}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`mb-2 ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                              >
                                <Card className="candidate-card">
                                  <Card.Body className="p-3">
                                    <div className="d-flex justify-content-between align-items-start">
                                      <div>
                                        <h6 className="mb-1">{candidate.fullName}</h6>
                                        <div className="d-flex align-items-center">
                                          {renderStars(candidate.averageScore)}
                                          <small className="ms-2 text-muted">
                                            {candidate.averageScore}/5
                                          </small>
                                        </div>
                                      </div>
                                      {updatingCandidate === candidate.id && (
                                        <Spinner animation="border" size="sm" />
                                      )}
                                    </div>
                                  </Card.Body>
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </DragDropContext>
    </Container>
  );
};

export default PositionPage;