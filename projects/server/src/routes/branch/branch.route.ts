import { Request, Response, Router } from 'express';
import BranchController from '../../controllers/branch/branch.controller';
import { permissionsMiddleware } from '../../middleware/permissions.middleware';

export class BranchRoute {
  route: Router;
  private branchController: BranchController;

  constructor() {
    this.route = Router();
    this.branchController = new BranchController();
    this.routes();
  }

  private routes() {
    this.route.get('/', permissionsMiddleware(['can_read_branch']), (req: Request, res: Response) =>
      this.branchController.getAllBranch(req, res)
    );
  }
}
