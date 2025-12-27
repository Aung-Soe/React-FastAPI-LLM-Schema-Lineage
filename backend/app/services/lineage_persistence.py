class LineagePersistenceService:
    def persist(self, nodes, edges):
        upsert nodes
        insert edges