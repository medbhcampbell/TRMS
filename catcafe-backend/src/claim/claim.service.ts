import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import dynamo from '../dynamo/dynamo';
import logger from '../log';
import { Claim, claimStatus } from './claim';

class ClaimService {
    private doc: DocumentClient;

    constructor() {
        this.doc = dynamo;
    }

    async getClaimsByUsername(username: string): Promise<Claim[] | null> {
        // GetItem api call allows us to get something by the key
        const params = {
            TableName: 'claims',
            KeyConditionExpression: '#claimer=:claimer',
            ExpressionAttributeNames: {
                '#claimer': 'claimer'
            },
            ExpressionAttributeValues: {
                ':claimer': username
            }
        };
        return await this.doc.query(params).promise().then((data) => {
            if (data && data.Items) {
                return data.Items as Claim[];
            } else {
                return null;
            }
        });
    }

    async getClaimsByClaimee(username: string): Promise<Claim[] | null> {
        const params = {
            TableName: 'claims',
            IndexName: 'claimeeIdIndex',
            KeyConditionExpression: '#claimee=:claimee',
            ExpressionAttributeNames: {
                '#claimee': 'claimee'
            },
            ExpressionAttributeValues: {
                ':claimee': username
            }
        };
        return await this.doc.query(params).promise().then((data) => {
            if (data && data.Items) {
                logger.debug(`getClaimsByClaimee data: ${JSON.stringify(data.Items)}`);
                return data.Items as Claim[];
            } else {
                return null;
            }
        }).catch((err) => {
            logger.error(err);
            return null;
        });
    }

    async getClaimsByInfoFrom(username: string): Promise<Claim[] | null> {
        const params = {
            TableName: 'claims',
            IndexName: 'infoIdIndex',
            KeyConditionExpression: '#infoFrom=:infoFrom',
            ExpressionAttributeNames: {
                '#infoFrom': 'infoFrom'
            },
            ExpressionAttributeValues: {
                ':infoFrom': username
            }
        };
        return await this.doc.query(params).promise().then((data) => {
            if (data && data.Items) {
                logger.debug(`getClaimsByInfoFrom data: ${JSON.stringify(data.Items)}`);
                return data.Items as Claim[];
            } else {
                return null;
            }
        }).catch((err) => {
            logger.error(err);
            return null;
        });
    }

    async updateClaim(claim: Claim): Promise<boolean> {
        // Could be updating any part of the claim, which makes writing an UpdateExpression difficult to impossible.
        // Just delete the claim and add it again

        await this.deleteClaim(claim.id, claim.claimer);
        await this.addClaim(claim);
        return true;
    }

    async deleteClaim(id: number, claimer: string): Promise<boolean> {
        // Delete the claim
        const params = {
            TableName: 'claims',
            Key: {
                'claimer': claimer,
                'id': id
            }
        }

        await this.doc.delete(params).promise();
        return true;
    }

    async addClaim(claim: Claim): Promise<boolean> {
        const params = {
            TableName: 'claims',
            Item: claim,
            ConditionExpression: '#id <> :id',
            ExpressionAttributeNames: {
                '#id': 'id',
            },
            ExpressionAttributeValues: {
                ':id': claim.id,
            }
        };

        return this.doc.put(params).promise().then(() => {
            logger.info(`Successfully added claim ${claim.id} to the DynamoDB`);
            return true;
        }).catch((error) => {
            logger.error(`Could not add claim to table: ${error}`);
            return false;
        });
    }

    async getMyClaimById(username: string, id: number): Promise<Claim | null> {
        const params = {
            TableName: 'claims',
            Key: {
                'claimer': username,
                'id': id
            }
        };
        return await this.doc.get(params).promise().then((data) => {
            if (data && data.Item) {
                return data.Item as Claim;
            } else {
                return null;
            }
        }).catch(err => {
            logger.error(err);
            return null;
        })
    }

    async getUClaimById(username: string, id: number): Promise<Claim | null> {
        const params = {
            TableName: 'claims',
            IndexName: 'claimeeIdIndex',
            KeyConditionExpression: '#claimee = :claimee and #id = :id',
            ExpressionAttributeValues: {
                ':claimee': username,
                ':id': id
            },
            ExpressionAttributeNames: {
                '#claimee': 'claimee',
                '#id': 'id'
            }
        };
        return await this.doc.query(params).promise().then((data) => {
            if (data && data.Items) {
                logger.debug(`getClaimsByClaimee data: ${JSON.stringify(data.Items)}`);
                return data.Items[0] as Claim;
            } else {
                return null;
            }
        }).catch((err) => {
            logger.error(err);
            return null;
        });
    }

    async getClaimByInfoId(username: string, id: number): Promise<Claim | null> {
        const params = {
            TableName: 'claims',
            IndexName: 'infoIdIndex',
            KeyConditionExpression: '#infoFrom = :infoFrom and #id = :id',
            ExpressionAttributeValues: {
                ':infoFrom': username,
                ':id': id
            },
            ExpressionAttributeNames: {
                '#infoFrom': 'infoFrom',
                '#id': 'id'
            }
        };
        return await this.doc.query(params).promise().then((data) => {
            if (data && data.Items) {
                logger.debug(`getClaimsByInfoFrom data: ${JSON.stringify(data.Items)}`);
                return data.Items[0] as Claim;
            } else {
                return null;
            }
        }).catch((err) => {
            logger.error(err);
            return null;
        });
    }

    //Once a week, we want to approve all claims that are at levels lower than BenCo
    // I know scans are inefficient, but this seems to be a reasonable use case
    async getAllClaims(): Promise<Claim[]> {
        const params = {
            TableName: 'claims',
            FilterExpression: '#status < :benCoApproval',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':benCoApproval': claimStatus.pending
            }
        };
        return await this.doc.scan(params).promise().then((data) => {
            return data.Items as Claim[];
        }).catch((err) => {
            logger.error(err);
            return [] as Claim[];
        })
    }
}

const claimService = new ClaimService();
export default claimService;

